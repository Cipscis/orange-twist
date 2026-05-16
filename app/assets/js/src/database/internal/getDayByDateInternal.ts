import { getIdbRequestPromise, type ExpandType } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a day based on a specified year, month, and day.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY} object store.
 * @param date An object containing the `year`, `month`, and `day` values for the day to retrieved.
 *
 * @returns A {@linkcode Promise} that resolves with the retrieved day object, or `null` if no day exists with the specified date.
 */
export async function getDayByDateInternal(
	transaction: IDBTransaction,
	date: ExpandType<Pick<
		DatabaseData[typeof ObjectStoreName.DAY][number], 'year' | 'month' | 'day'
	>>
): Promise<
	| DatabaseData[typeof ObjectStoreName.DAY][number]
	| null
> {
	const { year, month, day } = date;
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayByDate = dayOS.index(IndexName.DAY_DATE);

	// TODO: Find a type-safe way to do this
	const request = dayByDate.get([year, month, day]) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.DAY][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
