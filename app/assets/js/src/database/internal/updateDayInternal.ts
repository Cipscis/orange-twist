import {
	getIdbRequestPromise,
	getIterableCursor,
	type OptionalExcept,
} from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing day.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY} object store.
 * @param day An object specifying which day to update by its ID, and providing any values that should be updated.
 *
 * @throws Error if no day exists with the specified ID.
 * @throws Error if the `year`, `month`, or `day` properties are modified.
 */
export async function updateDayInternal(
	transaction: IDBTransaction,
	day: OptionalExcept<
		DatabaseData[typeof ObjectStoreName.DAY][number], 'id'
	>
): Promise<void> {
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);

	const requests: Promise<IDBValidKey>[] = [];
	for await (const dayCursor of getIterableCursor(dayOS, day.id)) {
		// This type assertion is safe because of other controls around what can be inserted into the database
		const dayCursorValue = dayCursor.value as DatabaseData[typeof ObjectStoreName.DAY][number];

		if (
			('year' in day && day.year !== dayCursorValue.year) ||
			('month' in day && day.month !== dayCursorValue.month) ||
			('day' in day && day.day !== dayCursorValue.day)
		) {
			throw new Error(`The year, month, and day properties of a day are immutable and cannot be modified.`);
		}

		requests.push(
			getIdbRequestPromise(
				dayCursor.update({
					...dayCursorValue,
					...day,
				})
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update day ${day.id} - No such day exists.`);
	}

	await Promise.all(requests);
}
