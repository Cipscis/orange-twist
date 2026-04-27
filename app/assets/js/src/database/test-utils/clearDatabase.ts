import { dbName } from 'database/metadata';
import { getDatabase } from 'utils/indexedDB';

/**
 * **Important!** For use within tests only.
 *
 * Clears any data and deletes the database, allowing for a fresh start.
 */
export async function clearDatabase(): Promise<void> {
	const database = await getDatabase();
	database.close();

	indexedDB.deleteDatabase(dbName);
}
