import { getIdbRequestPromise } from 'utils/indexedDB';

import type { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';

/**
 * **Important** Intended for internal use within the database API only.
 *
 * Returns all days, when provided with the days {@linkcode IDBObjectStore} from within an existing transaction.
 */
export async function getDaysInternal(daysOS: IDBObjectStore): Promise<
	DatabaseData[typeof ObjectStoreName.DAY][number][]
> {
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
