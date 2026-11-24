import type { VersionedDatabaseData } from './VersionedDatabaseData';

import type { DatabaseDataV1_0_0 } from './V1_0_0';
import type { DatabaseDataV2_0_0 } from './DatabaseDataV2_0_0';

/**
 * A {@linkcode VersionedDatabaseData} tagged with a schema version.
 */
export type TaggedVersionedDatabaseData =
	| {
		schemaVersion: '1.0.0';
		data: DatabaseDataV1_0_0;
	}
	| {
		schemaVersion: '2.0.0';
		data: DatabaseDataV2_0_0;
	};
