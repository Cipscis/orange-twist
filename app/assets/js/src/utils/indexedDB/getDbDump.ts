import { getIdbRequestPromise } from './getIdbRequestPromise';
import { getIterableCursor } from './getIterableCursor';

/**
 * Construct an object containing all data from a given database.
 *
 * Assumes the database exists at the specified version and has no open connections.
 *
 * @throws {Error} if a key is encountered that is neither a string nor a number.
 */
export async function getDbDump(
	dbName: string,
	dbVersion: number,
): Promise<Record<
	string, Record<string | number, unknown>
>> {
	const db = await getIdbRequestPromise(indexedDB.open(dbName, dbVersion));

	const data: Record<
		string, Record<string | number, unknown>
	> = {};

	for (const objectStoreName of Array.from(db.objectStoreNames)) {
		data[objectStoreName] = await getObjectStoreDump(db, objectStoreName);
	}
	db.close();

	return data;
}

/**
 * Dump an {@linkcode IDBDatabase}'s object store's data into an object.
 *
 * Assumes the object store exists on this database.
 */
async function getObjectStoreDump(
	db: IDBDatabase,
	objectStoreName: string,
): Promise<Record<string, unknown>> {
	const objectStoreData: Record<string, unknown> = {};

	const transaction = db.transaction(objectStoreName, 'readonly');
	const objectStore = transaction.objectStore(objectStoreName);

	for await (const { key, value } of getIterableCursor(objectStore)) {
		if (typeof key !== 'string' && typeof key !== 'number') {
			throw new Error('Error: Encountered a key that was neither a string nor a number');
		}

		objectStoreData[key] = value;
	}

	return objectStoreData;
}
