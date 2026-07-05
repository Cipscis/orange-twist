import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all tasks.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.TASK} object store.
 *
 * @returns A {@linkcode Promise} that resolves to an array containing all tasks, sorted according to their `sortIndex` property.
 */
export async function getTasksInternal(transaction: IDBTransaction): Promise<
	DatabaseData[typeof ObjectStoreName.TASK][number][]
> {
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = taskOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.TASK][number][]
	>;

	const tasks = await getIdbRequestPromise(request);
	const sortedTasks = sortBySortIndex(tasks);

	return sortedTasks;
}
