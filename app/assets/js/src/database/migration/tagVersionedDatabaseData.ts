import {
	isDatabaseDataV1_0_0,
	isDatabaseDataV2_0_0,
	type VersionedDatabaseData,
	type TaggedVersionedDatabaseData,
} from '../types';

/**
 * Determine the schema version of a specified {@linkcode VersionedDatabaseData} and returned a tagged copy.
 *
 * @throws {Error} if no schema version could be determined.
 */
export function tagVersionedDatabaseData(data: Readonly<VersionedDatabaseData>): TaggedVersionedDatabaseData {
	if (isDatabaseDataV2_0_0(data)) {
		return {
			schemaVersion: '2.0.0',
			data,
		};
	}

	if (isDatabaseDataV1_0_0(data)) {
		return {
			schemaVersion: '1.0.0',
			data,
		};
	}

	throw new Error('Could not determine schema version of LegacyExportData');
}
