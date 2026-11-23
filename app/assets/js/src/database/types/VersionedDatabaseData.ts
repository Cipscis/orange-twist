import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils';

import {
	databaseDataSchemaV1_0_0,
	databaseDataSchemaV2_0_0,
} from './VersionedDatabaseDataVersions';

export const versionedDatabaseDataSchema = z.union([
	databaseDataSchemaV1_0_0,
	databaseDataSchemaV2_0_0,
]);

/**
 * Either current export data or any previous iteration.
 */
export type VersionedDatabaseData = z.infer<typeof versionedDatabaseDataSchema>;

export const isVersionedDatabaseData = isZodSchemaType(versionedDatabaseDataSchema);
