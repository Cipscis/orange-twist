import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all day tasks.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY_TASK} object store.
 *
 * @returns A {@linkcode Promise} that resolves with an array containing all day tasks, sorted according to their `sortIndex` property.
 */
export async function getDayTasksInternal(transaction: IDBTransaction): Promise<
	DatabaseData[typeof ObjectStoreName.DAY_TASK][number][]
> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	// TODO: Find a type-safe way to do this
	const request = dayTaskOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.DAY_TASK][number][]
	>;

	const dayTasks = await getIdbRequestPromise(request);
	const sortedDayTasks = sortBySortIndex(dayTasks);

	return sortedDayTasks;
}
