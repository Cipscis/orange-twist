import type { PersistApi } from 'persist/PersistApi';

/**
 * A {@linkcode PersistApi} interface for working with the IndexedDB API, reading from the database v2 but providing data with schema v1.
 */
export const dbV1: PersistApi = {
	async set(key, data) {
		// Do nothing - this part of the adapter is not needed
	},

	async get(key) {
		// Do nothing - this part of the adapter is not needed
	},
};
