import {
	isLegacyExportDataV1_0_0,
	isLegacyExportDataV2_0_0,
	type LegacyExportData,
	type TaggedLegacyExportData,
} from 'database/types';

/**
 * Return the schema version of a specified {@linkcode LegacyExportData} and returned a tagged copy.
 *
 * @throws {Error} if no schema version could be determined.
 */
export function tagLegacyExportData(legacyData: Readonly<LegacyExportData>): TaggedLegacyExportData {
	if (isLegacyExportDataV2_0_0(legacyData)) {
		return {
			schemaVersion: '2.0.0',
			data: legacyData,
		};
	}

	if (isLegacyExportDataV1_0_0(legacyData)) {
		return {
			schemaVersion: '1.0.0',
			data: legacyData,
		};
	}

	throw new Error('Could not determine schema version of LegacyExportData');
}
