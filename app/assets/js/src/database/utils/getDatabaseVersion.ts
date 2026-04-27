import { dbName } from 'database/metadata';

/**
 * Determine the version of the existing database, or return `null` if the database doesn't exist yet.
 */
export async function getDatabaseVersion(): Promise<number | null> {
	const existingDbs = await indexedDB.databases();
	// TODO: Avoid this magic string
	const existingDb = existingDbs.find(({ name }) => name === dbName);
	const existingDbVersion = existingDb?.version;
	return existingDbVersion ?? null;
}
