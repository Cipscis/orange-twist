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
	reportProgress?: (progress: number) => void,
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
	const requests: IDBRequest[] = [];
	for (const objectStoreName of objectStoreNames) {
		const objectStore = transaction.objectStore(objectStoreName);

		// Start by clearing the object store
		requests.push(objectStore.clear());

		// Then, fill the object store with new data
		const objectStoreData = data[objectStoreName];
		for (const value of Object.values(objectStoreData)) {
			requests.push(
				objectStore.put(value)
			);
		}
	}

	if (reportProgress) {
		const chunkSize = Math.floor(requests.length / 100);
		for (let i = 0; i < requests.length; i += chunkSize) {
			await getIdbRequestPromise(requests[i]);
			reportProgress(i / requests.length);
		}
	}

	// This type assertion is safe because each object store at least has its clear request
	const lastRequest = requests.at(-1)!;
	await getIdbRequestPromise(lastRequest);
}
