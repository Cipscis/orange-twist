import type { LegacyExportData } from './LegacyExportData';
import type {
	LegacyExportDataV1_0_0,
	LegacyExportDataV2_0_0,
} from './LegacyExportDataVersions';

/**
 * A {@linkcode LegacyExportData} tagged with a schema version.
 */
export type TaggedLegacyExportData =
	| {
		schemaVersion: '1.0.0';
		data: LegacyExportDataV1_0_0;
	}
	| {
		schemaVersion: '2.0.0';
		data: LegacyExportDataV2_0_0;
	};
