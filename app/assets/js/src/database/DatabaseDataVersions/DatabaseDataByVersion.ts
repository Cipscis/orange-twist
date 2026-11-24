import type {
	VersionedDatabaseData,
	TaggedVersionedDatabaseData,
} from '../types';

/**
 * Utility function for retrieving a specific version of {@linkcode VersionedDatabaseData}.
 */
export type DatabaseDataByVersion<
	V extends TaggedVersionedDatabaseData['schemaVersion']
> = Extract<TaggedVersionedDatabaseData, { schemaVersion: V; }>['data'];
