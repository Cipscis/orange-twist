import type { LegacyExportData } from 'data/shared/types';
import { getIdbRequestPromise } from '../getIdbRequestPromise';
import { isLegacyExportData } from 'data/shared/types/LegacyExportData';
import { getEntries } from '../getEntries';

export async function getDbDump(dbName: string, dbVersion: number): Promise<LegacyExportData> {
	const db = await getIdbRequestPromise(indexedDB.open(dbName, dbVersion));

	const data: Record<string, unknown> = {
		// TODO: How should this actually be set?
		schemaVersion: '1.0.0',
	};

	for (let i = 0; i < db.objectStoreNames.length; i++) {
		const objectStoreName = db.objectStoreNames.item(i)!;
		data[objectStoreName] = await getObjectStoreDump(db, objectStoreName);
	}
	db.close();


	if (isLegacyExportData(data)) {
		return data;
	} else {
		throw new Error('Database does not contain valid export data');
	}
}

/**
 * Dump an {@linkcode IDBDatabase}'s object store's data into an object.
 *
 * Assumes the object store exists on this database.
 */
async function getObjectStoreDump(db: IDBDatabase, objectStoreName: string): Promise<Record<string, unknown>> {
	const objectStoreData: Record<string, unknown> = {};

	const transaction = db.transaction(objectStoreName, 'readonly');
	const objectStore = transaction.objectStore(objectStoreName);

	for await (const [key, value] of getEntries(objectStore)) {
		if (typeof key !== 'string') {
			// TODO: Handle non-string keys
			throw new Error('Error: Encountered non-key string');
		}
		objectStoreData[key] = value;
	}

	return objectStoreData;
}
