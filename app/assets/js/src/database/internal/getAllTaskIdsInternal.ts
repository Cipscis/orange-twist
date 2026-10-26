import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all task IDs.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.TASK} object store.
 *
 * @returns A {@linkcode Promise} that resolves to an array containing all task IDs.
 */
export async function getAllTaskIdsInternal(transaction: IDBTransaction): Promise<
	readonly number[]
> {
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = taskOS.getAllKeys() as IDBRequest<
		number[]
	>;

	const taskIds = await getIdbRequestPromise(request);

	return taskIds;
}
