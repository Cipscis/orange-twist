import { getIdbRequestPromise, getIterableCursor } from 'utils';

import { IndexName } from '../metadata';

export async function removeDayInternal(
	dayOS: IDBObjectStore,
	dayTaskOS: IDBObjectStore,
	id: IDBValidKey,
): Promise<void> {
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
