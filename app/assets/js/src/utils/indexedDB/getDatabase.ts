import { isLegacyExportData, type TaggedLegacyExportData } from 'data/shared/types';
import { migrateToLatest } from './migration';
import { getDbDump } from './migration/getDbDump';
import { tagLegacyExportData } from 'data/shared/updateData/tagLegacyExportData';
import { updateData } from 'data/shared/updateData';

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

	const existingDbVersion = await getExistingDbVersion(dbName);
	const dbNeedsUpdate = (
		existingDbVersion !== null && (
			// TODO: Remove this `|| true` debugging condition that's temporarily forcing a data dump
			existingDbVersion < dbVersion || true
		)
	);

	// If the database needs to update, dump a copy of its data into memory and update it
	if (dbNeedsUpdate) {
		// TODO: Handle errors based on invalid data in database
		const oldDbDump = await dumpOldDatabaseData(dbName, existingDbVersion);
		console.log(oldDbDump);

		const updatedData = await updateData(oldDbDump);
		console.log(updatedData);
	}

	const request = indexedDB.open(dbName, dbVersion);

	request.addEventListener('upgradeneeded', (e) => {
		const db = request.result;

		migrateToLatest(e, db);
	});

	// Handle success
	request.addEventListener('success', () => {
		// TODO: Once the upgrade is complete, dump the updated data into the new database

		resolve(request.result);
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

async function dumpOldDatabaseData(dbName: string, existingDbVersion: number): Promise<TaggedLegacyExportData> {
	// TODO: The database will need to be migrated, so grab all the data out of it
	const dbDump = await getDbDump(dbName, existingDbVersion);

	if (isLegacyExportData(dbDump)) {
		try {
			const taggedData = tagLegacyExportData(dbDump);
			return taggedData;
		} catch (e) {
			// TODO: Handle potential error
			console.error(dbDump);
			throw e;
		}
	} else {
		console.error(dbDump);
		throw new Error('Database does not contain valid export data');
	}
}
