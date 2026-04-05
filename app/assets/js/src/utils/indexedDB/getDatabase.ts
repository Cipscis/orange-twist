import { migrateToLatest } from './migration';

const dbName = 'orange-twist';
const dbVersion = 2;

let dbPromise: Promise<IDBDatabase> | null = null;
/**
 * Get a handle to the database, opening it if it wasn't
 * already open.
 */
export function getDatabase(): Promise<IDBDatabase> {
	if (dbPromise) {
		return dbPromise;
	}

	dbPromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, dbVersion);

		request.addEventListener('upgradeneeded', (e) => {
			const db = request.result;

			migrateToLatest(e, db);
		});

		// Handle success
		request.addEventListener('success', () => {
			resolve(request.result);
		});

		// Handle errors
		request.addEventListener('error', () => reject(request.error));
		request.addEventListener('blocked', () => reject(new Error('Open database request was blocked')));
	});

	return dbPromise;
}
