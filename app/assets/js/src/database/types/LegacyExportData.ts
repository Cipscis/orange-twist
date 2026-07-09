import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils';

import {
	legacyExportDataSchemaV1_0_0,
	legacyExportDataSchemaV2_0_0,
} from './LegacyExportDataVersions';

export const legacyExportDataSchema = z.union([
	legacyExportDataSchemaV1_0_0,
	legacyExportDataSchemaV2_0_0,
]);

/**
 * Either current export data or any previous iteration.
 */
export type LegacyExportData = z.infer<typeof legacyExportDataSchema>;

export const isLegacyExportData = isZodSchemaType(legacyExportDataSchema);
