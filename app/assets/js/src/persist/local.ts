import type { PersistApi } from './PersistApi';

import { idb } from './idb';
import { ls } from './ls';

/**
 * A {@linkcode PersistApi} interface for working with data
 * locally. It prefers IndexedDB, but if it contains no
 * data will read from LocalStorage as a backup.
 *
 * This backup is primarily intended to facilitate
 * migration from storing data in LocalStorage to storing
 * it in IndexedDB.
 */
export const local: PersistApi = {
	set(key, data) {
		// Set IndexedDB only
		return idb.set(key, data);
	},

	async get(key) {
		// Try to read from IndexedDB first
		const idbResult = await idb.get(key);
		if (typeof idbResult !== 'undefined') {
			return idbResult;
		}

		// If that failed, read from LocalStorage
		return await ls.get(key);
	},

	delete(key) {
		// Delete key from both IndexedDB and LocalStorage
		return Promise.all([
			idb.delete(key),
			ls.delete(key),
		]) as Promise<unknown> as Promise<void>;
		// ^ It's safe to cast any Promise to void
	},
};
