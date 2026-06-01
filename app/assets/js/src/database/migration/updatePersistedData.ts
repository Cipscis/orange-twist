import type { DatabaseData } from '../types';
import { getDatabaseVersion } from '../utils';
import { dbName, dbVersion } from '../metadata';

import { getTaggedLsDump } from './getTaggedLsDump';
import { getTaggedDbDump } from './getTaggedDbDump';
import { updateData } from './updateData';

/**
 * Retrieve any persisted data and update it to a {@linkcode DatabaseData} object.
 */
export async function updatePersistedData(): Promise<DatabaseData | null> {
	// If the database needs to update, dump a copy of its data into memory and update it
	const updatedData: DatabaseData | null = await (async () => {
		const existingDbVersion = await getDatabaseVersion();
		const dbNeedsUpdatedData = (
			// The database did not exist before, or...
			existingDbVersion === null ||
			// The version we want to use now is newer than the old one
			existingDbVersion < dbVersion
		);

		if (!dbNeedsUpdatedData) {
			return null;
		}

		const oldDataDump = existingDbVersion === null
			? getTaggedLsDump()
			: await getTaggedDbDump(dbName, existingDbVersion);

		if (!oldDataDump) {
			return null;
		}

		const updatedData = await updateData(oldDataDump);
		return updatedData;
	})();

	return updatedData;
}
