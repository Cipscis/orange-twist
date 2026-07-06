import { getIdbRequestPromise } from 'utils';

import type { DatabaseData } from '../types';
import { ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all statuses.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.STATUS} object store.
 *
 * @returns A {@linkcode Promise} that resolves with an array containing all status objects.
 */
export async function getStatusesInternal(
	transaction: IDBTransaction
): Promise<DatabaseData[typeof ObjectStoreName.STATUS][number][]> {
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = statusOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.STATUS][number][]
	>;

	const statuses = await getIdbRequestPromise(request);

	return statuses;
}
