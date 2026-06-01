import { dbName } from '../metadata';

/**
 * Determine the version of the existing database, or `null` if the database doesn't exist yet.
 */
export async function getDatabaseVersion(): Promise<number | null> {
	const existingDbs = await indexedDB.databases();
	const existingDb = existingDbs.find(({ name }) => name === dbName);
	const existingDbVersion = existingDb?.version;
	return existingDbVersion ?? null;
}
