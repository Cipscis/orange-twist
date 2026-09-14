import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { Day } from '../types';

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
	| Day
	| null
> {
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = dayOS.get(dayId) as IDBRequest<
		| Day
		| undefined
	>;

	const day = await getIdbRequestPromise(request);

	return day ?? null;
}
