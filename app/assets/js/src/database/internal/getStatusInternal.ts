import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a status by a specified ID.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.STATUS} object store.
 *
 * @returns A {@linkcode Promise} that resolves to the status with the specified ID, or `null` if no such status exists.
 */
export async function getStatusInternal(
	transaction: IDBTransaction,
	id: number
): Promise<
	| DatabaseData[typeof ObjectStoreName.STATUS][number]
	| null
> {
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = statusOS.get(id) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.STATUS][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
