import { assertAllUnionMembersHandled } from 'utils';
import type { DatabaseData, LegacyExportData } from '../types';
import type { LegacyStatusName } from '../types/LegacyExportDataVersions';
import { decodeDayTaskKey } from 'data/dayTasks/util';

/**
 * Update legacy export data to match the current database schema.
 */
export async function updateData(legacyData: LegacyExportData): Promise<DatabaseData> {
	if (legacyData.schemaVersion === '1.0.0') {
		// Update to v2.0.0

		const getDayNameParts = (dayName: string) => dayName.split('-').map((part) => Number(part));

		const day: DatabaseData['day'] = legacyData.days.map(([dayName, legacyDay], id) => {
			const [year, month, day] = getDayNameParts(dayName);

			return {
				id,
				note: legacyDay.note,
				year,
				month,
				day,
			};
		});

		const getDayIdByName = (dayName: string) => {
			const [yearToMatch, monthToMatch, dayToMatch] = getDayNameParts(dayName);

			const matchingDay = day.find(({ year, month, day }) => {
				return year === yearToMatch &&
				month === monthToMatch &&
				day === dayToMatch;
			});

			return matchingDay?.id ?? null;
		};

		// Collect statuses in data set, starting with defaults
		const statusSet = new Set<string>([
			'todo',
			'in-progress',
			'completed',

			'investigating',
			'in-review',
			'ready-to-test',
			'paused',
			'approved-to-deploy',
			'will-not-do',
		] satisfies LegacyStatusName[]);
		for (const [, { status }] of legacyData.tasks) {
			statusSet.add(status);
		}
		for (const [, { status }] of legacyData.dayTasks) {
			statusSet.add(status);
		}

		const status: DatabaseData['status'] = Array.from(statusSet).map((name, id) => ({
			id,
			name,
			isComplete: ['completed', 'will-not-do'].includes(name),
		}));

		const getStatusIdByName = (statusName: LegacyStatusName) => status.find(({ name }) => name === statusName)?.id ?? 0;

		const task: DatabaseData['task'] = legacyData.tasks.map(([id, taskInfo]) => ({
			id,
			name: taskInfo.name,
			note: ('note' in taskInfo) ? taskInfo.note : '',
			sortIndex: ('sortIndex' in taskInfo) ? taskInfo.sortIndex : null,
			status: getStatusIdByName(taskInfo.status),
		}));

		const day_task: DatabaseData['day_task'] = legacyData.dayTasks.map(
			([dayTaskKey, dayTaskInfo], id) => {
				const { dayName, taskId } = decodeDayTaskKey(dayTaskKey);

				const dayId = (() => {
					const dayId = getDayIdByName(dayName);
					if (typeof dayId === 'number') {
						return dayId;
					}

					// Otherwise, construct a new day and insert it, then use that id
					const nextId = Math.max(...day.map(({ id }) => id));
					const [year, month, dayNumber] = getDayNameParts(dayName);
					day.push({
						id: nextId,
						year,
						month,
						day: dayNumber,
						note: '',
					});
					return nextId;
				})();

				const sortIndex = (() => {
					const legacyDayInfo = legacyData.days.find(([name]) => name === dayName)?.[1];
					if (!legacyDayInfo) {
						return null;
					}

					const dayTaskIndex = legacyDayInfo.tasks.indexOf(taskId);
					if (dayTaskIndex === -1) {
						return null;
					}

					return dayTaskIndex;
				})();

				return {
					id,
					day: dayId,
					task: taskId,
					note: dayTaskInfo.note,
					status: getStatusIdByName(dayTaskInfo.status),
					summary: ('summary' in dayTaskInfo) ? dayTaskInfo.summary : '',
					sortIndex,
				};
			}
		);

		const template: DatabaseData['template'] = legacyData.templates?.map(([id, templateInfo]) => ({
			id,
			name: templateInfo.name,
			template: templateInfo.template,
			sortIndex: templateInfo.sortIndex,
		})) ?? [];

		const image: DatabaseData['image'] = await Promise.all(
			legacyData.images?.map(async ([hash, data], id) => {
				const file = await (async () => {
					if (data instanceof Blob) {
						return data;
					}

					const url = new URL(data);
					if (url.protocol !== 'data:') {
						throw new Error('Error during data update: Unsafe URL encountered');
					}

					const imageResponse = await fetch(url);
					const imageBlob = await imageResponse.blob();

					return imageBlob;
				})();

				return {
					id,
					hash,
					file,
				};
			}) ?? []
		);

		const updatedData: DatabaseData = {
			schemaVersion: '2.0.0',

			day,
			task,
			day_task,
			status,
			template,
			image,
		};

		return updatedData;
	} else if (legacyData.schemaVersion === '2.0.0') {
		return legacyData;
	} else {
		assertAllUnionMembersHandled(legacyData);
	}
}
