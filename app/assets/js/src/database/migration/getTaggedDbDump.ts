import { getDbDump } from 'utils';

import { isVersionedDatabaseData, type TaggedVersionedDatabaseData } from '../types';

import { tagVersionedDatabaseData } from './tagVersionedDatabaseData';

/**
 * Gets a dump of a specified database and tags it with the appropriate schema version.
 *
 * @throws {Error} if the dumped data doesn't match any schema version.
 */
export async function getTaggedDbDump(dbName: string, dbVersion: number): Promise<TaggedVersionedDatabaseData> {
	const dbDump = await getDbDump(dbName, dbVersion);

	if (isVersionedDatabaseData(dbDump)) {
		const taggedData = tagVersionedDatabaseData(dbDump);
		return taggedData;
	} else {
		throw new Error('Database does not contain valid export data');
	}
}
