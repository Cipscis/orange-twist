import { getIdbRequestPromise, getIterableCursor } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove a day and all its linked day tasks.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY} and {@linkcode ObjectStoreName.DAY_TASK} object stores.
 * @param id The ID of the day to delete.
 *
 * @returns A {@linkcode Promise} that resolves when the day and all its linked day tasks have been removed.
 */
export async function removeDayInternal(
	transaction: IDBTransaction,
	id: IDBValidKey,
): Promise<void> {
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

	for await (const cursor of dayTaskIterableCursor) {
		requests.push(cursor.delete());
	}

	await Promise.all(requests.map(
		(request) => getIdbRequestPromise(request)
	));
}
