import {
	fillDatabase,
	migrateToLatest,
} from '../migration';
import { dbName, dbVersion } from '../metadata';
import { updatePersistedData } from '../migration/updatePersistedData';

let dbPromise: Promise<IDBDatabase> | null = null;
/**
 * Get a handle to the database, opening it if it wasn't
 * already open.
 *
 * @param force By default, the same database open request is reused with each call. If this parameter is set to `true`, a new open request is created.
 */
export async function getDatabase(
	force = false
): Promise<IDBDatabase> {
	if (dbPromise && !force) {
		return dbPromise;
	}

	const {
		promise,
		resolve,
		reject,
	} = Promise.withResolvers<IDBDatabase>();
	dbPromise = promise;

	const updatedData = await updatePersistedData();

	const request = indexedDB.open(dbName, dbVersion);

	request.addEventListener('upgradeneeded', (e) => {
		const db = request.result;

		migrateToLatest(e, db);
	});

	// Handle success
	request.addEventListener('success', async () => {
		const db = request.result;
		// Once the upgrade is complete, dump the updated data into the new database
		if (updatedData) {
			try {
				await fillDatabase(db, updatedData);
			} catch (e) {
				reject(e);
			}
		}
		resolve(db);
	});

	// Handle errors
	request.addEventListener('error', () => reject(request.error!));
	request.addEventListener('blocked', () => reject(new Error('Open database request was blocked')));

	return dbPromise;
}
