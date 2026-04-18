import { StorageKey } from 'data/shared';
import type { PersistApi } from 'persist/PersistApi';
import {
	ObjectStoreName,
	doDatabaseTransaction,
} from 'utils';
import {
	getDaysV1,
	getDayTasksV1,
	getTasksV1,
	getTemplatesV1,
} from 'database';

/**
 * A {@linkcode PersistApi} interface for working with the
 * IndexedDB API.
 */
export const idb: PersistApi = {
	async set(key, data) {
		await doDatabaseTransaction(
			'readwrite',
			[ObjectStoreName.DATA],
			([objectStore]) => objectStore.put(data, key)
		);
	},

	async get(key) {
		if (key === StorageKey.DAYS) {
			return getDaysV1();
		} else if (key === StorageKey.DAY_TASKS) {
			return getDayTasksV1();
		} else if (key === StorageKey.TASKS) {
			return getTasksV1();
		} else if (key === StorageKey.TEMPLATES) {
			return getTemplatesV1();
		} else {
			return doDatabaseTransaction(
				'readonly',
				[ObjectStoreName.DATA],
				([objectStore]) => objectStore.get(key)
			);
		}
	},

	async delete(key) {
		await doDatabaseTransaction(
			'readwrite',
			[ObjectStoreName.DATA],
			([objectStore]) => objectStore.delete(key)
		);
	},
};
