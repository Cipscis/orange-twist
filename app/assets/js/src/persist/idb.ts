import { StorageKey } from 'data/shared';
import type { PersistApi } from 'persist/PersistApi';
import {
	doDatabaseTransaction,
} from 'utils';
import { getDatabase } from 'utils/indexedDB';

import { adapterV1 } from 'database';
import { getDatabaseVersion } from 'database/utils';
import { ObjectStoreName } from 'database/metadata';

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
		// TODO: Get rid of this unnecessary retrieval, just used to make sure the database has been upgraded first
		await getDatabase();
		// TODO: Get rid of this database v1 handling
		const dbVersion = await getDatabaseVersion();
		if (dbVersion === 1 || dbVersion === null) {
			return doDatabaseTransaction(
				'readonly',
				[ObjectStoreName.DATA],
				([objectStore]) => objectStore.get(key)
			);
		}

		if (key === StorageKey.DAYS) {
			return adapterV1.getDays();
		} else if (key === StorageKey.DAY_TASKS) {
			return adapterV1.getDayTasks();
		} else if (key === StorageKey.TASKS) {
			return adapterV1.getTasks();
		} else if (key === StorageKey.TEMPLATES) {
			return adapterV1.getTemplates();
		} else {
			throw new RangeError(`Unrecognised key ${key}`);
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
