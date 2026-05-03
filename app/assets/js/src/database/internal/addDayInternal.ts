import { getIdbRequestPromise } from 'utils/indexedDB';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';
import { getDayByDateInternal } from './getDayByDateInternal';

export async function addDayInternal(
	dayOS: IDBObjectStore,
	day: Omit<DatabaseData[typeof ObjectStoreName.DAY][number], 'id'>
): Promise<DatabaseData[typeof ObjectStoreName.DAY][number]['id']> {
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
