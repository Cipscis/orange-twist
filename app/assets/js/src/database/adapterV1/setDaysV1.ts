import type { DayInfo } from 'data/days';

import { getIdbRequestPromise } from 'utils';

import { getDatabase, getDayNameParts } from '../utils';
import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';
import {
	addDayInternal,
	addDayTaskInternal,
	getDayByDateInternal,
	getDayTasksForDayInternal,
	removeDayInternal,
	removeDayTaskInternal,
	updateDayInternal,
	updateDayTaskByDayAndTaskInternal,
} from '../internal';

/**
 * Overwrites all day information in the database v2, using {@linkcode DayInfo} information from schema v1.
 */
export async function setDaysV1(
	days: readonly (readonly [string, DayInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.TASK,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.STATUS,
	], 'readwrite');

	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const promises: (Promise<unknown>)[] = [];
	const newDayIds = new Set<number>();

	for (const [dayName, dayInfo] of days) {
		const [year, month, day] = getDayNameParts(dayName);

		const existingDay = await getDayByDateInternal(transaction, { year, month, day });

		if (existingDay) {
			newDayIds.add(existingDay.id);
			// Update an existing day
			promises.push(updateExistingDay({
				transaction,
				dayTaskOS,
				dayInfo,
				existingDay,
			}));
			continue;
		}

		// Create a new day
		const addNewDayPromise = addNewDay({
			transaction,
			dayInfo,
			year,
			month,
			day,
		});
		addNewDayPromise.then((newDayId) => newDayIds.add(newDayId));
		promises.push(addNewDayPromise);
	}

	// Remove any days not in the data
	const existingDayIds = new Set(await getIdbRequestPromise(dayOS.getAllKeys()));
	// Wait for `newDayIds` to be fully populated
	await Promise.all(promises);

	const removedDayIds = existingDayIds.difference(newDayIds);

	for (const dayId of removedDayIds) {
		promises.push(removeDayInternal(
			transaction,
			dayId,
		));
	}

	await Promise.all(promises);
}

/**
 * Add a new day, and all its day tasks.
 *
 * @returns The ID of the newly added day.
 */
async function addNewDay(options: {
	transaction: IDBTransaction;
	dayInfo: DayInfo;
	year: number;
	month: number;
	day: number;
}): Promise<number> {
	const {
		transaction,
		dayInfo,
		year,
		month,
		day,
	} = options;

	const newDayId = await addDayInternal(transaction, {
		year,
		month,
		day,
		note: dayInfo.note,
	});

	// Create the new day's day tasks
	const dayTaskRequests: Promise<unknown>[] = [];
	for (const [sortIndex, task] of dayInfo.tasks.entries()) {
		dayTaskRequests.push(
			addDayTaskInternal(transaction, {
				day: newDayId,
				task,
				sortIndex,
			})
		);
	}

	await Promise.all(dayTaskRequests);

	return newDayId;
}

/**
 * Update an existing day, and all its day tasks.
 */
async function updateExistingDay(options: {
	transaction: IDBTransaction;
	dayTaskOS: IDBObjectStore;
	dayInfo: DayInfo;
	existingDay: DatabaseData[typeof ObjectStoreName.DAY][number];
}): Promise<void> {
	const {
		transaction,
		dayInfo,
		existingDay,
	} = options;

	const promises: Promise<unknown>[] = [];

	// Update an existing day's note
	promises.push(
		updateDayInternal(transaction, {
			...existingDay,
			note: dayInfo.note,
		})
	);

	const existingDayTasks = await getDayTasksForDayInternal(transaction, existingDay.id);

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
	promises.push(
		...Array.from(addedDayTaskTaskIds).map((taskId) => {
			return addDayTaskInternal(transaction, {
				day: existingDay.id,
				task: taskId,
				sortIndex: dayInfo.tasks.indexOf(taskId),
			});
		})
	);

	// Remove any missing day tasks
	promises.push(
		...Array.from(removedDayTaskTaskIds).map((taskId) => {
			// This non-null assertion is safe because of other controls around what can be inserted into the database
			const existingDayTask = existingDayTasksByTaskId.get(taskId)!;

			return removeDayTaskInternal(transaction, existingDayTask.id);
		})
	);

	// Update sort index of remaining day tasks
	promises.push(
		...Array.from(remainingDayTaskTaskIds).map((taskId) => {
			return updateDayTaskByDayAndTaskInternal(transaction, {
				day: existingDay.id,
				task: taskId,
				sortIndex: dayInfo.tasks.indexOf(taskId),
			});
		})
	);

	await Promise.all(promises);
}
