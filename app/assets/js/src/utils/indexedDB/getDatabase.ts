import {
	fillDatabase,
	getTaggedDbDump,
	migrateToLatest,
	updateData,
} from 'data/shared/migration';

const dbName = 'orange-twist';
const dbVersion = 1;

let dbPromise: Promise<IDBDatabase> | null = null;
/**
 * Get a handle to the database, opening it if it wasn't
 * already open.
 */
export async function getDatabase(): Promise<IDBDatabase> {
	if (dbPromise) {
		return dbPromise;
	}

	const {
		promise,
		resolve,
		reject,
	} = Promise.withResolvers<IDBDatabase>();
	dbPromise = promise;

	// If the database needs to update, dump a copy of its data into memory and update it
	const updatedDbData = await (async () => {
		const existingDbVersion = await getExistingDbVersion(dbName);
		const dbNeedsUpdatedData = (
			// The database existed before, and...
			existingDbVersion !== null &&
			// The version we want to use now is newer than the old one
			existingDbVersion < dbVersion
		);

		if (!dbNeedsUpdatedData) {
			return null;
		}

		// TODO: Handle errors based on invalid data in database
		const oldDbDump = await getTaggedDbDump(dbName, existingDbVersion);

		const updatedData = await updateData(oldDbDump);
		return updatedData;
	})();

	const request = indexedDB.open(dbName, dbVersion);

	request.addEventListener('upgradeneeded', (e) => {
		const db = request.result;

		migrateToLatest(e, db);
	});

	// Handle success
	request.addEventListener('success', async () => {
		const db = request.result;
		// Once the upgrade is complete, dump the updated data into the new database
		if (updatedDbData) {
			try {
				await fillDatabase(db, updatedDbData);
			} catch (e) {
				// TODO: Handle error filling database
				console.error(e);
				console.error((e as DOMException).name);
			}
		}
		resolve(db);
	});

	// Handle errors
	request.addEventListener('error', () => reject(request.error!));
	request.addEventListener('blocked', () => reject(new Error('Open database request was blocked')));

	return dbPromise;
}

/**
 * Determine the version of the existing database, or return `null` if the database doesn't exist yet.
 */
async function getExistingDbVersion(dbName: string): Promise<number | null> {
	const existingDbs = await indexedDB.databases();
	const existingDb = existingDbs.find(({ name }) => name === dbName);
	const existingDbVersion = existingDb?.version;
	return existingDbVersion ?? null;
}
