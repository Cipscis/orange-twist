import {
	getIdbRequestPromise,
	getIterableCursor,
	type ExpandType,
	type OptionalExcept,
} from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing day.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY} object store.
 * @param day An object specifying which day to update by its year, month, and day, and providing any values that should be updated.
 *
 * @throws Error if no day exists with the specified year, month, and day.
 */
export async function updateDayInternal(
	transaction: IDBTransaction,
	day: OptionalExcept<
		Omit<DatabaseData[typeof ObjectStoreName.DAY][number], 'id'>,
		'year' | 'month' | 'day'
	>
): Promise<void> {
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayByDate = dayOS.index(IndexName.DAY_DATE);

	const requests: Promise<IDBValidKey>[] = [];
	for await (const dayCursor of getIterableCursor(dayByDate, [day.year, day.month, day.day])) {
		requests.push(
			getIdbRequestPromise(
				dayCursor.update({
					...dayCursor.value,
					...day,
				})
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update day ${[day.year, day.month, day.day]} - No such day exists.`);
	}

	await Promise.all(requests);
}
