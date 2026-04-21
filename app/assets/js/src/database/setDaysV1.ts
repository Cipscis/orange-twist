import type { DayInfo } from 'data/days';
import { IndexName } from 'data/shared/IndexName';
import type { DatabaseData } from 'data/shared/types';
import {
	getDatabase,
	getIdbRequestPromise,
	ObjectStoreName,
} from 'utils/indexedDB';

export async function setDaysV1(
	days: readonly (readonly [string, DayInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
	], 'readwrite');

	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayByDate = dayOS.index(IndexName.DAY_DATE);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const requests: IDBRequest<IDBValidKey>[] = [];

	for (const [dayName, dayInfo] of days) {
		// TODO: Make a type-safe way of doing this
		const [year, month, day] = getDayNameParts(dayName);
		const keyRange = [year, month, day];
		const existingDay = await getIdbRequestPromise(
			dayByDate.get(keyRange) as IDBRequest<DatabaseData['day'][number]>
		);

		console.log(dayName, keyRange, existingDay);
		if (existingDay) {
			// Update an existing day
			requests.push(
				dayOS.put({
					...existingDay,
					note: dayInfo.note,
				})
			);
		} else {
			// Create a new day
			requests.push(
				dayOS.put({
					year,
					month,
					day,
					note: dayInfo.note,
				})
			);
		}
	}

	// TODO: Remove any days not in the data

	// TODO: Update day tasks

	await Promise.all(requests.map(getIdbRequestPromise));
}


// TODO: This function is copied from updateDataV1_0_0
/**
 * Convert a legacy day name into numeric parts. For example, `'2026-04-12'` becomes `[2026, 4, 12]`.
 */
function getDayNameParts(dayName: string): [number, number, number] {
	const parts = dayName.split('-');
	const year = Number(parts[0]);
	const month = Number(parts[1]);
	const day = Number(parts[2]);

	return [year, month, day];
}
