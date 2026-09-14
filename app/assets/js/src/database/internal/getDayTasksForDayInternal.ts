import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DayTask } from '../types';

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
	DayTask[]
> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const dayTaskByDay = dayTaskOS.index(IndexName.DAY_TASK_DAY);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = dayTaskByDay.getAll(dayId) as IDBRequest<
		DayTask[]
	>;

	const dayTasks = await getIdbRequestPromise(request);

	const sortedDayTasks = sortBySortIndex(dayTasks);

	return sortedDayTasks;
}
