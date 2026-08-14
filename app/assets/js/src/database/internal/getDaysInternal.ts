import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';
import { sortDaysChronologically } from '../utils';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all days.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY} object store.
 *
 * @returns A {@linkcode Promise} that resolves with an array containing all day objects, sorted chronologically.
 */
export async function getDaysInternal(transaction: IDBTransaction): Promise<
	DatabaseData[typeof ObjectStoreName.DAY][number][]
> {
	const daysOS = transaction.objectStore(ObjectStoreName.DAY);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = daysOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.DAY][number][]
	>;

	const days = await getIdbRequestPromise(request);
	const sortedDays = days.toSorted(sortDaysChronologically);

	return sortedDays;
}
