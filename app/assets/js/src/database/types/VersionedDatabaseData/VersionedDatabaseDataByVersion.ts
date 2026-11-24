import type { VersionedDatabaseData } from './VersionedDatabaseData';
import type { TaggedVersionedDatabaseData } from './TaggedVersionedDatabaseData';

/**
 * Utility function for retrieving a specific version of {@linkcode VersionedDatabaseData}.
 */
export type VersionedDatabaseDataByVersion<
	V extends TaggedVersionedDatabaseData['schemaVersion']
> = Extract<TaggedVersionedDatabaseData, { schemaVersion: V; }>['data'];
