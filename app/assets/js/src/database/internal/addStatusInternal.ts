import { getIdbRequestPromise, type WithOptional } from 'utils';

import type { DatabaseData } from '../types';
import { ObjectStoreName } from '../metadata';

import { getStatusInternal } from './getStatusInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to insert a new status to the status object store.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.STATUS} object store.
 * @param status The status object to insert.
 *
 * @returns A {@linkcode Promise} that resolves with the status's ID when it has been added.
 *
 * @throws Error if a status already exists with the specified ID.
 * @throws TypeError if the database returns a non-number key after adding.
 */
export async function addStatusInternal(
	transaction: IDBTransaction,
	status: WithOptional<
		DatabaseData[typeof ObjectStoreName.STATUS][number],
		'id'
	>
): Promise<number> {
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

	if (typeof status.id !== 'undefined') {
		const existingStatus = await getStatusInternal(transaction, status.id);
		if (existingStatus) {
			throw new Error(`Cannot add status - status already exists with ID ${status.id}`);
		}
	}

	const request = statusOS.add(status);

	const result = await getIdbRequestPromise(request);
	if (!(typeof result === 'number')) {
		throw new TypeError(`The key for a status should be a number. Received ${JSON.stringify(result, null, '\t')}`);
	}

	return result;
}
