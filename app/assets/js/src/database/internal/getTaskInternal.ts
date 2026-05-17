import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get the task with a specified ID.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.TASK} object store.
 * @param id The ID of the task to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves with the retrieved task object, or `null` if no task exists with the specified ID.
 */
export async function getTaskInternal(
	transaction: IDBTransaction,
	id: number
): Promise<
	| DatabaseData[typeof ObjectStoreName.TASK][number]
	| null
> {
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	// TODO: Find a way to make this type safe
	const request = taskOS.get(id) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.TASK][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
