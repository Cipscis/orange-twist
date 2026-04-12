import type { LegacyExportData } from '../LegacyExportData';

/**
 * Utility function for retrieving a specific version of {@linkcode LegacyExportData}.
 */
export type LegacyExportDataByVersion<V extends LegacyExportData['schemaVersion']> = Extract<LegacyExportData, { schemaVersion: V; }>;
