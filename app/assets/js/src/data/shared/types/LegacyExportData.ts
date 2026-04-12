import type { LegacyExportDataV1_0_0 } from './LegacyExportDataVersions';
import type { DatabaseData } from './DatabaseData';

/**
 * Either current export data or any previous iteration.
 */
export type LegacyExportData =
	| LegacyExportDataV1_0_0
	| DatabaseData;
