import { migrateToLatest } from './migration';

const dbName = 'orange-twist';
const dbVersion = 2;

let db: IDBDatabase | null = null;
/**
 * Get a handle to the database, opening it if it wasn't
 * already open.
 */
export function getDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (db) {
			resolve(db);
			return;
		}

		const request = indexedDB.open(dbName, dbVersion);

		request.addEventListener('upgradeneeded', ({ oldVersion }) => {
			const db = request.result;

			migrateToLatest(oldVersion, db);
		});

		// Handle success
		request.addEventListener('success', () => {
			db = request.result;
			resolve(request.result);
		});

		// Handle errors
		request.addEventListener('error', () => reject(request.error));
		request.addEventListener('blocked', () => reject(new Error('Open database request was blocked')));
	});
}
