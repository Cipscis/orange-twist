import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DayTask } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all day tasks.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY_TASK} object store.
 *
 * @returns A {@linkcode Promise} that resolves with an array containing all day tasks, sorted according to their `sortIndex` property.
 */
export async function getDayTasksInternal(transaction: IDBTransaction): Promise<
	DayTask[]
> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = dayTaskOS.getAll() as IDBRequest<
		DayTask[]
	>;

	const dayTasks = await getIdbRequestPromise(request);
	const sortedDayTasks = sortBySortIndex(dayTasks);

	return sortedDayTasks;
}
