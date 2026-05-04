import type { DayInfo } from 'data/days';

import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { getDatabase } from '../utils';
import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';
import {
	addDayInternal,
	addDayTaskInternal,
	getDayTasksForDayInternal,
	updateDayInternal,
} from '../internal';

export async function setDaysV1(
	days: readonly (readonly [string, DayInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.TASK,
	], 'readwrite');

	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayByDate = dayOS.index(IndexName.DAY_DATE);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	const requests: (Promise<unknown>)[] = [];

	for (const [dayName, dayInfo] of days) {
		const [year, month, day] = getDayNameParts(dayName);
		const indexKey = [year, month, day];

		const existingDay = await getIdbRequestPromise(
			dayByDate.get(indexKey) as IDBRequest<DatabaseData[typeof ObjectStoreName.DAY][number]>
		);

		if (!existingDay) {
			// Create a new day
			requests.push(addNewDay({
				dayOS,
				dayTaskOS,
				taskOS,
				dayInfo,
				year,
				month,
				day,
			}));
			continue;
		}

		// Update an existing day's note
		requests.push(
			updateDayInternal(dayOS, {
				...existingDay,
				note: dayInfo.note,
			})
		);

		const existingDayTasks = sortBySortIndex(
			await getDayTasksForDayInternal(dayTaskOS, existingDay.id)
		);

		const existingDayTasksByTaskId = new Map(
			existingDayTasks.map((dayTask) => ([
				dayTask.task,
				dayTask,
			]))
		);

		const preDayTaskTaskIds = new Set(
			existingDayTasks.map(({ task }) => task)
		);
		const postDayTaskTaskIds = new Set(dayInfo.tasks);

		const removedDayTaskTaskIds = preDayTaskTaskIds.difference(postDayTaskTaskIds);
		const addedDayTaskTaskIds = postDayTaskTaskIds.difference(preDayTaskTaskIds);
		const remainingDayTaskTaskIds = preDayTaskTaskIds.intersection(postDayTaskTaskIds);

		// Add any new day tasks
		requests.push(
			...Array.from(addedDayTaskTaskIds).map((taskId) => {
				const dayTask = {
					day: existingDay.id,
					task: taskId,
					// TODO - Make sure this is the right initial status
					status: 0,
					note: '',
					summary: null,
					sortIndex: dayInfo.tasks.indexOf(taskId),
				} satisfies Omit<DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'id'>;

				console.log('adding', dayTask);
				return getIdbRequestPromise(dayTaskOS.put(dayTask));
			})
		);

		// Remove any missing day tasks
		requests.push(
			...Array.from(removedDayTaskTaskIds).map((taskId) => {
				// TODO: This non-null assertion isn't safe
				const existingDayTask = existingDayTasksByTaskId.get(taskId)!;

				console.log('deleting', existingDayTask.id);
				const request = dayTaskOS.delete(existingDayTask.id);
				request.addEventListener('error', () => console.error(request));
				request.addEventListener('success', () => console.log(request));
				return getIdbRequestPromise(request);
			})
		);

		// Update sort index of remaining day tasks
		requests.push(
			...Array.from(remainingDayTaskTaskIds).map((taskId) => {
				// TODO: This non-null assertion isn't safe
				const existingDayTask = existingDayTasksByTaskId.get(taskId)!;

				console.log('updating', existingDayTask);
				return getIdbRequestPromise(dayTaskOS.put({
					...existingDayTask,
					sortIndex: dayInfo.tasks.indexOf(taskId),
				}));
			})
		);
	}

	// TODO: Remove any days not in the data

	await Promise.all(requests);
}

/**
 * Add a new day, and all its day tasks.
 */
async function addNewDay(options: {
	dayOS: IDBObjectStore;
	dayTaskOS: IDBObjectStore;
	taskOS: IDBObjectStore;
	dayInfo: DayInfo;
	year: number;
	month: number;
	day: number;
}) {
	const {
		dayOS,
		dayTaskOS,
		taskOS,
		dayInfo,
		year,
		month,
		day,
	} = options;

	const newDayId = await addDayInternal(dayOS, {
		year,
		month,
		day,
		note: dayInfo.note,
	});

	// Create the new day's day tasks
	const dayTaskRequests: Promise<unknown>[] = [];
	for (const [sortIndex, task] of dayInfo.tasks.entries()) {
		dayTaskRequests.push(addDayTaskInternal(dayTaskOS, dayOS, taskOS, {
			day: newDayId,
			task: task,
			sortIndex,
		}));
	}

	return Promise.all(dayTaskRequests);
}

// TODO: This function is copied from updateDataV1_0_0
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
