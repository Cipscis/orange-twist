import { getDbDump } from 'utils';

import { isLegacyExportData, type TaggedLegacyExportData } from '../types';

import { tagLegacyExportData } from './tagLegacyExportData';

/**
 * Gets a dump of a specified database and tags it with the appropriate schema version.
 *
 * @throws {Error} if the dumped data doesn't match any schema version.
 */
export async function getTaggedDbDump(dbName: string, dbVersion: number): Promise<TaggedLegacyExportData> {
	const dbDump = await getDbDump(dbName, dbVersion);

	if (isLegacyExportData(dbDump)) {
		try {
			const taggedData = tagLegacyExportData(dbDump);
			return taggedData;
		} catch (e) {
			// TODO: Handle this error
			console.error(dbDump);
			throw e;
		}
	} else {
		// TODO: Handle this error?
		throw new Error('Database does not contain valid export data');
	}
}
