import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a day based on a specified ID.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY} object store.
 * @param dayId The ID of the day to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves with the retrieved day object, or `null` if no day exists with the specified ID.
 */
export async function getDayInternal(
	transaction: IDBTransaction,
	dayId: number,
): Promise<
	| DatabaseData[typeof ObjectStoreName.DAY][number]
	| null
> {
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);

	// TODO: Find a type-safe way to do this
	const request = dayOS.get(dayId) as IDBRequest<
		DatabaseData[typeof ObjectStoreName.DAY][number] | undefined
	>;

	const day = await getIdbRequestPromise(request);

	return day ?? null;
}
