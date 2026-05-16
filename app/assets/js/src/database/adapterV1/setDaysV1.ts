import type { DayInfo } from 'data/days';

import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { getDatabase } from '../utils';
import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';
import {
	addDayInternal,
	addDayTaskInternal,
	getDayTasksForDayInternal,
	removeDayInternal,
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
		ObjectStoreName.STATUS,
	], 'readwrite');

	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayByDate = dayOS.index(IndexName.DAY_DATE);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const promises: (Promise<unknown>)[] = [];
	const newDayIds = new Set<number>();

	for (const [dayName, dayInfo] of days) {
		const [year, month, day] = getDayNameParts(dayName);
		const indexKey = [year, month, day];

		const existingDay = await getIdbRequestPromise(
			dayByDate.get(indexKey) as IDBRequest<DatabaseData[typeof ObjectStoreName.DAY][number]>
		);

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
		dayTaskRequests.push(addDayTaskInternal(transaction, {
			day: newDayId,
			task,
			sortIndex,
		}));
	}

	await Promise.all(dayTaskRequests);

	return newDayId;
}

async function updateExistingDay(options: {
	transaction: IDBTransaction;
	dayTaskOS: IDBObjectStore;
	dayInfo: DayInfo;
	existingDay: DatabaseData[typeof ObjectStoreName.DAY][number];
}) {
	const {
		transaction,
		dayTaskOS,
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

	const existingDayTasks = sortBySortIndex(
		await getDayTasksForDayInternal(transaction, existingDay.id)
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
			// TODO: This non-null assertion isn't safe
			const existingDayTask = existingDayTasksByTaskId.get(taskId)!;

			const request = dayTaskOS.delete(existingDayTask.id);
			return getIdbRequestPromise(request);
		})
	);

	// Update sort index of remaining day tasks
	promises.push(
		...Array.from(remainingDayTaskTaskIds).map((taskId) => {
			// TODO: This non-null assertion isn't safe
			const existingDayTask = existingDayTasksByTaskId.get(taskId)!;

			return getIdbRequestPromise(dayTaskOS.put({
				...existingDayTask,
				sortIndex: dayInfo.tasks.indexOf(taskId),
			}));
		})
	);

	return Promise.all(promises);
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
