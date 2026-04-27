import { getIdbRequestPromise } from 'utils/indexedDB';
import type { DatabaseData } from '../types';
import { ObjectStoreName } from 'database/metadata';

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
	const requestPromises: Promise<IDBValidKey>[] = [];
	for (const objectStoreName of objectStoreNames) {
		const objectStoreData = data[objectStoreName];

		const objectStore = transaction.objectStore(objectStoreName);

		for (const value of Object.values(objectStoreData)) {
			requestPromises.push(
				getIdbRequestPromise(objectStore.put(value))
			);
		}
	}

	await Promise.all(requestPromises);
}
