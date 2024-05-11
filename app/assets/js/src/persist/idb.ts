import type { PersistApi } from 'persist/PersistApi';
import {
	ObjectStoreName,
	doDatabaseTransaction,
} from 'utils';

/**
 * A {@linkcode PersistApi} interface for working with the
 * IndexedDB API.
 */
export const idb: PersistApi = {
	async set(key, data) {
		await doDatabaseTransaction(
			'readwrite',
			ObjectStoreName.DATA,
			(objectStore) => objectStore.put(data, key)
		);
	},

	get(key) {
		return doDatabaseTransaction(
			'readonly',
			ObjectStoreName.DATA,
			(objectStore) => objectStore.get(key)
		);
	},

	async delete(key) {
		await doDatabaseTransaction(
			'readwrite',
			ObjectStoreName.DATA,
			(objectStore) => objectStore.delete(key)
		);
	},
};
