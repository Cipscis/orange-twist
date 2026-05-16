import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

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

	// TODO: Find a type-safe way of doing this
	const request = daysOS.getAll() as IDBRequest<DatabaseData[typeof ObjectStoreName.DAY][number][]>;

	const days = await getIdbRequestPromise(request);
	const sortedDays = days.toSorted(sortDaysChronologically);

	return sortedDays;
}

/**
 * Returns a number for use within `Array.toSorted`, used to sort two days chronologically
 */
function sortDaysChronologically(
	dayA: DatabaseData[typeof ObjectStoreName.DAY][number],
	dayB: DatabaseData[typeof ObjectStoreName.DAY][number],
): number {
	const yearDiff = dayA.year - dayB.year;
	if (yearDiff) {
		return yearDiff;
	}

	const monthDiff = dayA.month - dayB.month;
	if (monthDiff) {
		return monthDiff;
	}

	const dayDiff = dayA.day - dayB.day;
	return dayDiff;
}
