import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Fill a database with specified data.
 *
 * @throws {Error} if any data could not be inserted e.g. due to invalid key.
 */
export async function fillDatabase(
	db: IDBDatabase,
	data: DatabaseData,
): Promise<void> {
	const objectStoreNames = [
		ObjectStoreName.DAY,
		ObjectStoreName.TASK,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.STATUS,
		ObjectStoreName.TEMPLATE,
		ObjectStoreName.IMAGE,
	] as const satisfies readonly ObjectStoreName[];

	const transaction = db.transaction(objectStoreNames, 'readwrite');
	const requestPromises: IDBRequest[] = [];
	for (const objectStoreName of objectStoreNames) {
		const objectStore = transaction.objectStore(objectStoreName);

		// Start by clearing the object store
		requestPromises.push(objectStore.clear());

		// Then, fill the object store with new data
		const objectStoreData = data[objectStoreName];
		for (const value of Object.values(objectStoreData)) {
			requestPromises.push(
				objectStore.put(value)
			);
		}
	}

	// This type assertion is safe because each object store at least has its clear request
	const lastRequest = requestPromises.at(-1)!;
	await getIdbRequestPromise(lastRequest);
}
