import {
	getIdbRequestPromise,
	getIterableCursor,
	type ExpandType,
} from 'utils';

import { IndexName, type ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function updateDayInternal(
	dayOS: IDBObjectStore,
	day: ExpandType<Pick<DatabaseData[typeof ObjectStoreName.DAY][number], 'year' | 'month' | 'day'> & Partial<Omit<DatabaseData[typeof ObjectStoreName.DAY][number], 'id' | 'year' | 'month' | 'day'>>>
): Promise<void> {
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
