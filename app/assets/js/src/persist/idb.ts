import type { PersistApi } from 'persist/PersistApi';

const dbName = 'orange-twist';
const objectStoreName = 'orange-twist';

let db: IDBDatabase | null = null;
/**
 * Get a handle to the database, opening it if it wasn't
 * already open.
 */
function getDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (db) {
			resolve(db);
			return;
		}

		const request = indexedDB.open(dbName);

		// Create object store when database is first created
		request.addEventListener('upgradeneeded', () => {
			request.result.createObjectStore(objectStoreName);
		});

		// Handle success
		request.addEventListener('success', () => {
			db = request.result;
			resolve(request.result);
		});

		// Handle errors
		request.addEventListener('error', reject);
		request.addEventListener('blocked', reject);
	});
}

/**
 * Handle the repetitive paperwork like starting a transaction
 * and wrapping things in a Promise.
 */
function doTransaction(
	mode: IDBTransactionMode,
	callback: (objectStore: IDBObjectStore) => IDBRequest
): Promise<unknown> {
	return new Promise((resolve, reject) => {
		getDatabase().then((db) => {
			const transaction = db.transaction(objectStoreName, mode);
			const objectStore = transaction.objectStore(objectStoreName);
			const request = callback(objectStore);

			request.addEventListener('success', () => resolve(request.result));
			request.addEventListener('error', () => reject(request.error));
		}).catch(reject);
	});
}

/**
 * A {@linkcode PersistApi} interface for working with the
 * IndexedDB API.
 */
export const idb: PersistApi = {
	async set(key, data) {
		await doTransaction(
			'readwrite',
			(objectStore) => objectStore.put(data, key)
		);
	},

	get(key) {
		return doTransaction(
			'readonly',
			(objectStore) => objectStore.get(key)
		);
	},

	async delete(key) {
		await doTransaction(
			'readwrite',
			(objectStore) => objectStore.delete(key)
		);
	},
};
