import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

import { getDayByDateInternal } from './getDayByDateInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to insert a new day to the day object store.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY} object store.
 * @param day The day object to insert.
 *
 * @returns A {@linkcode Promise} that resolves when the day has been added.
 *
 * @throws Error if a day with the same year, month, and day already exists.
 * @throws TypeError if the database returns a non-number key after adding.
 */
export async function addDayInternal(
	transaction: IDBTransaction,
	day: Omit<DatabaseData[typeof ObjectStoreName.DAY][number], 'id'>
): Promise<DatabaseData[typeof ObjectStoreName.DAY][number]['id']> {
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);

	const existingDay = await getDayByDateInternal(dayOS, day);
	if (existingDay) {
		throw new Error(`Cannot add day - day already exists: ${[day.year, day.month, day.day]}`);
	}

	const request = dayOS.add(day);

	const result = await getIdbRequestPromise(request);
	if (!(typeof result === 'number')) {
		throw new TypeError(`The key for a day should be a number. Received ${JSON.stringify(result, null, '\t')}`);
	}

	return result;
}
