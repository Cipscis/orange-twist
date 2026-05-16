import { getIdbRequestPromise } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a status by a specified name.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.STATUS} object store.
 * @param name The name of the status to be retrieved.
 *
 * @returns A {@linkcode Promise} that resolves with the status that has the specified name, or `null` if no such status exists.
 */
export async function getStatusByNameInternal(
	transaction: IDBTransaction,
	name: string,
): Promise<
	| DatabaseData[typeof ObjectStoreName.STATUS][number]
	| null
> {
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);
	const statusByName = statusOS.index(IndexName.STATUS_NAME);

	// TODO: Find a way to make this type safe
	const request = statusByName.get(name) as IDBRequest<
			| DatabaseData[typeof ObjectStoreName.STATUS][number]
			| undefined
		>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
