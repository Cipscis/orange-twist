import { decodeDayTaskKey, encodeDayTaskKey } from 'data/dayTasks';

import { copyBlob, getCurrentDateDayName } from 'utils';

import type {
	LegacyExportData,
	LegacyExportDataByVersion,
	LegacyStatusName,
} from '../types';
import { getDayName, getDayNameParts } from '../utils';

import { collectStatusData } from './collectStatusData';

/**
 * Update a {@linkcode LegacyExportData} from schema version `1.0.0` to schema version `2.0.0`.
 */
export async function updateDataV1_0_0(
	legacyData: LegacyExportDataByVersion<'1.0.0'>
): Promise<LegacyExportDataByVersion<'2.0.0'>> {
	const updatedLegacyData = addMissingDayTasks(legacyData);

	const day = collectDayData(updatedLegacyData);
	const status = collectStatusData(updatedLegacyData);
	const task = collectTaskData(updatedLegacyData, status);
	const day_task = collectDayTaskData(updatedLegacyData, day, status);
	const template = collectTemplateData(updatedLegacyData);
	const image = await collectImageData(updatedLegacyData);

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
		Object.entries(legacyData.images).map(async ([hash, data]) => {
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
 * Within schema version `2.0.0` day data, look up the ID of a day based on its legacy day name.
 *
 * If no day is found, returns `null`.
 */
function getDayIdByName(
	dayName: string,
	dayData: Readonly<LegacyExportDataByVersion<'2.0.0'>['day']>,
): number | null {
	const [yearToMatch, monthToMatch, dayToMatch] = getDayNameParts(dayName);

	const matchingDay = Object.values(dayData)
		.find(({ year, month, day }) => {
			return year === yearToMatch &&
			month === monthToMatch &&
			day === dayToMatch;
		});

	return matchingDay?.id ?? null;
}

/**
 * Within schema version `2.0.0` status data, look up the ID of a status based on its legacy name.
 *
 * If no status is found, returns the ID of the first status by default (`1`).
 */
function getStatusIdByName(
	statusName: LegacyStatusName,
	statusData: Readonly<LegacyExportDataByVersion<'2.0.0'>['status']>,
): number {
	const matchingStatus = Object.values(statusData)
		.find(({ alias }) => alias === statusName);

	return matchingStatus?.id ?? 1;
}

/**
 * If a task has a status that isn't recorded in its final day task, then it requires a new day task to be created during migration to record that status. If the task's final day task is today or later, then that day task may require a new day for it to be created on.
 *
 * This function adds any necessary days and day tasks to legacy data before its transformation to schema version 2.0.0.
 */
function addMissingDayTasks(
	legacyData: Readonly<LegacyExportDataByVersion<'1.0.0'>>
): Readonly<LegacyExportDataByVersion<'1.0.0'>> {
	const updatedLegacyData = structuredClone(legacyData);

	for (const [, taskInfo] of legacyData.data.tasks) {
		// First, determine if there is a task status mismatch and, if so, what the day name of the task's final day task is
		const [taskStatusMismatch, finalDayTaskDayName] = getTaskStatusMismatch(
			taskInfo,
			legacyData.data['day-tasks'],
		);

		// We only need to do anything if there is a task status mismatch
		if (!taskStatusMismatch) {
			continue;
		}

		// Determine what day name to use for the new day task, based on the task's final day task and today's date
		const dayNameToUse = getDayNameForStatusMismatchDayTask(finalDayTaskDayName);

		// If the day doesn't exist, create it
		let dayToUse = updatedLegacyData.data.days.find(
			([dayName]) => dayName === dayNameToUse
		)?.[1];
		if (!dayToUse) {
			dayToUse = {
				name: dayNameToUse,
				note: '',
				tasks: [],
			};
			updatedLegacyData.data.days.push([
				dayNameToUse,
				dayToUse,
			]);
		}

		// This type assertion is safe because the data is only used for migration, and we are assuring coherence by also creating a day task
		(dayToUse.tasks as typeof dayToUse.tasks[number][]).push(taskInfo.id);

		// Create a new day task
		const newDayTask: LegacyExportDataByVersion<'1.0.0'>['data']['day-tasks'][number][1] = {
			dayName: dayNameToUse,
			taskId: taskInfo.id,
			status: taskInfo.status,
			summary: null,
			note: 'This day task was created automatically during database migration, to ensure the task\'s final status is unchanged.',
		};
		updatedLegacyData.data['day-tasks'].push([
			encodeDayTaskKey(newDayTask),
			newDayTask,
		]);
	}

	return updatedLegacyData;
}

/**
 * Determine if a specified task has a status mismatch. If it does, and it has day tasks, also return the name of the day associated with the task's final day task.
 */
function getTaskStatusMismatch(
	taskInfo: Readonly<LegacyExportDataByVersion<'1.0.0'>['data']['tasks'][number][1]>,
	dayTasks: Readonly<LegacyExportDataByVersion<'1.0.0'>['data']['day-tasks']>,
): readonly [taskStatusMismatch: boolean, finalDayTaskDayName: string | null] {
	const unsortedTaskDayTasks = dayTasks.filter(
		([key]) => {
			const { taskId } = decodeDayTaskKey(key);
			return taskId === taskInfo.id;
		}
	);

	// If there are no day tasks for this task, there is a status mismatch
	if (unsortedTaskDayTasks.length === 0) {
		// Unless the task has the default status
		if (taskInfo.status === 'todo') {
			return [false, null] as const;
		}
		return [true, null] as const;
	}

	const sortedTaskDayTasks = unsortedTaskDayTasks.sort(([keyA], [keyB]) => {
		const { dayName: dayNameA } = decodeDayTaskKey(keyA);
		const { dayName: dayNameB } = decodeDayTaskKey(keyB);
		return dayNameA.localeCompare(dayNameB);
	});

	// This non-null assertion is safe because we've already checked that the array doesn't have length 0
	const finalTaskDayTask = sortedTaskDayTasks.at(-1)!;

	const taskStatusMismatch = finalTaskDayTask[1].status !== taskInfo.status;
	const finalDayTaskDayName = decodeDayTaskKey(finalTaskDayTask[0]).dayName;

	return [taskStatusMismatch, finalDayTaskDayName] as const;
}

/**
 * If a task has a status mismatch, then a new day task must be created during migration to reconcile that mismatch. This function determines which day that day task should be created for, based on the final day task's day and the current day.
 *
 * Creating new day tasks on the current day is preferred, as it makes them immediately visible to the user. If the final day task was after the current day, then the new day task will be created the day after it.
 */
function getDayNameForStatusMismatchDayTask(
	finalDayTaskDayName: string | null,
) {
	const today = getCurrentDateDayName();
	// If the final dayTask's day is not today or later, use today
	if (
		!finalDayTaskDayName ||
		today.localeCompare(finalDayTaskDayName) === 1
	) {
		return today;
	}

	// Otherwise, use the day after the final dayTask's day
	const [year, month, day] = getDayNameParts(finalDayTaskDayName);
	const nextDay = new Date(year, month-1, day+1);
	const nextDayName = getDayName({
		year: nextDay.getFullYear(),
		month: nextDay.getMonth()+1,
		day: nextDay.getDate(),
	});

	return nextDayName;
}
