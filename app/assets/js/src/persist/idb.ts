import type { PersistApi } from 'persist/PersistApi';
import { doDatabaseTransaction } from 'utils';

import { ObjectStoreName } from 'database/metadata';

/**
 * A {@linkcode PersistApi} interface for working with the IndexedDB API, using the database schema v1.
 */
export const idb: PersistApi = {
	async set(key, data) {
		await doDatabaseTransaction(
			'readwrite',
			[ObjectStoreName.DATA],
			([objectStore]) => objectStore.put(data, key)
		);
	},

	get(key) {
		return doDatabaseTransaction(
			'readonly',
			[ObjectStoreName.DATA],
			([objectStore]) => objectStore.get(key)
		);
	},

	async delete(key) {
		await doDatabaseTransaction(
			'readwrite',
			[ObjectStoreName.DATA],
			([objectStore]) => objectStore.delete(key)
		);
	},
};
