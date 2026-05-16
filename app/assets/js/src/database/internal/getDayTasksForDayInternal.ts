import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all day tasks for a specified day.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY_TASK} object store.
 * @param dayId The ID of the day whose day tasks should be retrieved.
 *
 * @returns A {@linkcode Promise} that resolves with an array containing all day tasks linked to the specified day, sorted according to their `sortIndex` property.
 */
export async function getDayTasksForDayInternal(
	transaction: IDBTransaction,
	dayId: number,
): Promise<
	DatabaseData[typeof ObjectStoreName.DAY_TASK][number][]
> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const dayTaskByDay = dayTaskOS.index(IndexName.DAY_TASK_DAY);

	// TODO: Find a way to make this type-safe
	const request = dayTaskByDay.getAll(dayId) as IDBRequest<
		DatabaseData[typeof ObjectStoreName.DAY_TASK][number][]
	>;

	const dayTasks = await getIdbRequestPromise(request);

	const sortedDayTasks = sortBySortIndex(dayTasks);

	return sortedDayTasks;
}
