import type { TaggedLegacyExportData } from '../TaggedLegacyExportData';

/**
 * Utility function for retrieving a specific version of {@linkcode LegacyExportData}.
 */
export type LegacyExportDataByVersion<
	V extends TaggedLegacyExportData['schemaVersion']
> = Extract<TaggedLegacyExportData, { schemaVersion: V; }>['data'];
