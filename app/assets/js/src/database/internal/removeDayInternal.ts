import { getIdbRequestPromise, getIterableCursor } from 'utils';

import type { DayTask } from '../types';
import { IndexName, ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove a day and all its linked day tasks.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY} and {@linkcode ObjectStoreName.DAY_TASK} object stores.
 * @param id The ID of the day to delete.
 *
 * @returns A {@linkcode Promise} that resolves to a list of removed day task IDs, once the day and all its linked day tasks have been removed.
 */
export async function removeDayInternal(
	transaction: IDBTransaction,
	id: IDBValidKey,
): Promise<number[]> {
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const requests: IDBRequest[] = [];

	const dayCursor = await getIdbRequestPromise(
		dayOS.openCursor(id)
	);

	if (!dayCursor) {
		// No cursor means the day doesn't exist
		throw new Error(`Cannot delete non-existent day with ID ${JSON.stringify(id)}`);
	}

	// Remove day
	const dayDeleteRequest = dayCursor.delete();
	requests.push(dayDeleteRequest);

	// Remove day tasks
	const dayTaskByDay = dayTaskOS.index(IndexName.DAY_TASK_DAY);
	const dayTaskIterableCursor = getIterableCursor(dayTaskByDay, id);
	const deletedDayTaskIds: number[] = [];

	for await (const cursor of dayTaskIterableCursor) {
		// This type assertion is save because we're iterating through an index on the day task object store
		const dayTask = cursor.value as DayTask;
		deletedDayTaskIds.push(dayTask.id);
		requests.push(cursor.delete());
	}

	// Only wait for the last request, to save time on function overhead
	// This non-null assertion is safe because requests always has at least one entry
	const lastRequest = requests.at(-1)!;
	await getIdbRequestPromise(lastRequest);

	return deletedDayTaskIds;
}
