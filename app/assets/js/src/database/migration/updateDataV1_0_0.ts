import { decodeDayTaskKey } from 'data/dayTasks/util';

import { copyBlob } from 'utils';

import type {
	LegacyExportData,
	LegacyExportDataByVersion,
	LegacyStatusName,
} from '../types';
import { collectStatusData } from './collectStatusData';

/**
 * Update a {@linkcode LegacyExportData} from schema version `1.0.0` to schema version `2.0.0`.
 */
export async function updateDataV1_0_0(
	legacyData: LegacyExportDataByVersion<'1.0.0'>
): Promise<LegacyExportDataByVersion<'2.0.0'>> {
	const day = collectDayData(legacyData);
	const status = collectStatusData(legacyData);
	const task = collectTaskData(legacyData, status);
	const day_task = collectDayTaskData(legacyData, day, status);
	const template = collectTemplateData(legacyData);
	const image = await collectImageData(legacyData);

	const updatedData: LegacyExportDataByVersion<'2.0.0'> = {
		day,
		task,
		day_task,
		status,
		template,
		image,
	};

	return updatedData;
}

/**
 * Collect day data suitable for schema version `2.0.0` from schema version `1.0.0` data.
 *
 * Days in the legacy data are sorted chronologically before being assigned IDs.
 */
function collectDayData(
	legacyData: Readonly<LegacyExportDataByVersion<'1.0.0'>>
): LegacyExportDataByVersion<'2.0.0'>['day'] {
	return (legacyData.data.days ?? [])
		.toSorted(
			([dayNameA], [dayNameB]) => dayNameA.localeCompare(dayNameB)
		)
		.map(([dayName, legacyDay], id) => {
			const [year, month, day] = getDayNameParts(dayName);

			return {
				id: id + 1, // IndexedDB IDs start from 1, so increment here to match,
				note: legacyDay.note,
				year,
				month,
				day,
			};
		});
}

/**
 * Collect task data suitable for schema version `2.0.0` from schema version `1.0.0` data and already collected status data for schema version `2.0.0`.
 */
function collectTaskData(
	legacyData: Readonly<LegacyExportDataByVersion<'1.0.0'>>,
	statusData: Readonly<LegacyExportDataByVersion<'2.0.0'>['status']>,
): LegacyExportDataByVersion<'2.0.0'>['task'] {
	return (legacyData.data.tasks ?? []).map(([id, taskInfo]) => ({
		id,
		name: taskInfo.name,
		note: ('note' in taskInfo) ? taskInfo.note : '',
		sortIndex: ('sortIndex' in taskInfo) ? taskInfo.sortIndex : null,
		status: getStatusIdByName(taskInfo.status, statusData),
	}));
}

/**
 * Collect day task data suitable for schema version `2.0.0` from schema version `1.0.0` data and already collected day and status data for schema version `2.0.0`.
 *
 * May insert new day information if day tasks are found for days that don't exist in dayData.
 */
function collectDayTaskData(
	legacyData: Readonly<LegacyExportDataByVersion<'1.0.0'>>,
	dayData: LegacyExportDataByVersion<'2.0.0'>['day'],
	statusData: Readonly<LegacyExportDataByVersion<'2.0.0'>['status']>
): LegacyExportDataByVersion<'2.0.0'>['day_task'] {
	return (legacyData.data['day-tasks'] ?? []).map(
		([dayTaskKey, dayTaskInfo], id) => {
			const { dayName, taskId } = decodeDayTaskKey(dayTaskKey);

			const dayId = (() => {
				const dayId = getDayIdByName(dayName, dayData);
				// If a day already exists, reuse its ID.
				if (typeof dayId === 'number') {
					return dayId;
				}

				// Otherwise, construct a new day and insert it, then use that ID
				const nextId = Math.max(...Object.values(dayData).map(({ id }) => id));
				const [year, month, dayNumber] = getDayNameParts(dayName);
				dayData[nextId] = {
					id: nextId,
					year,
					month,
					day: dayNumber,
					note: '',
				};
				return nextId;
			})();

			// Construct the day task's sortIndex based on its position in the day's array of tasks
			const sortIndex = (() => {
				const legacyDayInfo = (legacyData.data.days ?? []).find(([name]) => name === dayName)?.[1];
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
				id: id + 1, // IndexedDB IDs start from 1, so increment here to match,
				day: dayId,
				task: taskId,
				note: dayTaskInfo.note,
				status: getStatusIdByName(dayTaskInfo.status, statusData),
				summary: ('summary' in dayTaskInfo) ? dayTaskInfo.summary : '',
				sortIndex,
			};
		}
	);
}

/**
 * Collect template data suitable for schema version `2.0.0` from schema version `1.0.0` data.
 */
function collectTemplateData(
	legacyData: Readonly<LegacyExportDataByVersion<'1.0.0'>>
): LegacyExportDataByVersion<'2.0.0'>['template'] {
	if (!legacyData.data.templates) {
		return [];
	}

	return legacyData.data.templates.map(([id, templateInfo]) => ({
		id,
		name: templateInfo.name,
		template: templateInfo.template,
		sortIndex: templateInfo.sortIndex,
	}));
}

/**
 * Collect image data suiable for schema version `2.0.0` from schema version `1.0.0` data.
 *
 * @throws {Error} if an unsafe URL string is encountered. Only `data:` protocol URLs are permitted.
 */
async function collectImageData(
	legacyData: Readonly<LegacyExportDataByVersion<'1.0.0'>>
): Promise<LegacyExportDataByVersion<'2.0.0'>['image']> {
	const images: LegacyExportDataByVersion<'2.0.0'>['image'] = {};

	if (!legacyData.images) {
		return images;
	}

	await Promise.all(
		Object.entries(legacyData.images).map(async ([hash, data], id) => {
			const file = await (async () => {
				if (data instanceof Blob) {
					return await copyBlob(data);
				}

				const url = new URL(data);
				if (url.protocol !== 'data:') {
					throw new Error('Error during data update: Unsafe URL encountered');
				}

				const imageResponse = await fetch(url);
				const imageBlob = await imageResponse.blob();

				return imageBlob;
			})();

			images[hash] = {
				hash,
				file,
			};
		})
	);

	return images;
}

/**
 * Convert a legacy day name into numeric parts. For example, `'2026-04-12'` becomes `[2026, 4, 12]`.
 */
function getDayNameParts(dayName: string): [number, number, number] {
	const parts = dayName.split('-');
	const year = Number(parts[0]);
	const month = Number(parts[1]);
	const day = Number(parts[2]);

	return [year, month, day];
}

/**
 * Within schema version `2.0.0` day data, look up the ID of a day based on its legacy day name.
 *
 * If no day is found, returns `null`.
 */
function getDayIdByName(
	dayName: string,
	dayData: Readonly<LegacyExportDataByVersion<'2.0.0'>['day']>,
): number | null {
	const [yearToMatch, monthToMatch, dayToMatch] = getDayNameParts(dayName);

	const matchingDay = Object.values(dayData).find(({ year, month, day }) => {
		return year === yearToMatch &&
		month === monthToMatch &&
		day === dayToMatch;
	});

	return matchingDay?.id ?? null;
}

/**
 * Within schema version `2.0.0` status data, look up the ID of a status based on its legacy name.
 *
 * If no status is found, returns the ID of the first status by default (`0`).
 */
function getStatusIdByName(
	statusName: LegacyStatusName,
	statusData: Readonly<LegacyExportDataByVersion<'2.0.0'>['status']>,
): number {
	const matchingStatus = Object.values(statusData).find(({ alias }) => alias === statusName);

	return matchingStatus?.id ?? 0;
}
