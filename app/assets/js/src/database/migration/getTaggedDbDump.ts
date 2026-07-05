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
		const taggedData = tagLegacyExportData(dbDump);
		return taggedData;
	} else {
		throw new Error('Database does not contain valid export data');
	}
}
