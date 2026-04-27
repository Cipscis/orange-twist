import type { PersistApi } from 'persist/PersistApi';
import { doDatabaseTransaction } from 'utils';

import type { DayInfo } from 'data';

import { adapterV1 } from 'database';
import { setDaysV1 } from 'database/setDaysV1';
import { getDatabaseVersion } from 'database/utils';
import { ObjectStoreName } from 'database/metadata';

/**
 * A {@linkcode PersistApi} interface for working with the IndexedDB API, using the database schema v1.
 */
export const idb: PersistApi = {
	async set(key, data) {
		// TODO: Get rid of this unnecessary retrieval, just used to make sure the database has been upgraded first
		await getDatabase();
		// TODO: Get rid of this database v1 handling
		const dbVersion = await getDatabaseVersion();
		if (dbVersion === 1 || dbVersion === null) {
			return await doDatabaseTransaction(
				'readwrite',
				[ObjectStoreName.DATA],
				([objectStore]) => objectStore.put(data, key)
			) as Promise<void>;
		}

		// TODO: Implement v2 handling
		if (key === StorageKey.DAYS) {
			// TODO: Find a type-safe way of doing this
			return setDaysV1(
				data as [string, DayInfo][]
			);
		} else {
			throw new Error('Setting with idb not implemented');
		}
	},

	get(key) {
		return doDatabaseTransaction(
			'readonly',
			[ObjectStoreName.DATA],
			([objectStore]) => objectStore.get(key)
		);
	},

	async delete(key) {
		// TODO: Get rid of this unnecessary retrieval, just used to make sure the database has been upgraded first
		await getDatabase();
		// TODO: Get rid of this database v1 handling
		const dbVersion = await getDatabaseVersion();
		if (dbVersion === 1 || dbVersion === null) {
			return await doDatabaseTransaction(
				'readwrite',
				[ObjectStoreName.DATA],
				([objectStore]) => objectStore.delete(key)
			) as Promise<void>;
		}

		// TODO: Implement v2 handling
		throw new Error('Deleting with idb not implemented');
	},
};
