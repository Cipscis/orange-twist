import type { PersistApi, PersistOptions } from 'persist/PersistApi';
import {
	ObjectStoreName,
	doDatabaseTransaction,
	type DefaultsFor,
} from 'utils';
import { bake } from './bake';

const defaultOptions = {
	profile: 'default',
} as const satisfies DefaultsFor<PersistOptions>;

/**
 * Determine what key to store data against, based on specified key and options.
 */
function getStorageKey(key: string, options: Required<PersistOptions>): string {
	if (options.profile === 'default') {
		return key;
	} else {
		return `${options.profile}__${key}`;
	}
}

/**
 * A {@linkcode PersistApi} interface for working with the
 * IndexedDB API.
 */
export const idb: PersistApi = {
	async set(key, data, options) {
		const fullOptions = {
			...defaultOptions,
			...options,
		};
		const storageKey = getStorageKey(key, fullOptions);

		await doDatabaseTransaction(
			'readwrite',
			ObjectStoreName.DATA,
			(objectStore) => objectStore.put(data, storageKey)
		);
	},

	get(key, options) {
		const fullOptions = {
			...defaultOptions,
			...options,
		};
		const storageKey = getStorageKey(key, fullOptions);

		return doDatabaseTransaction(
			'readonly',
			ObjectStoreName.DATA,
			(objectStore) => objectStore.get(storageKey)
		);
	},

	async delete(key, options) {
		const fullOptions = {
			...defaultOptions,
			...options,
		};
		const storageKey = getStorageKey(key, fullOptions);

		await doDatabaseTransaction(
			'readwrite',
			ObjectStoreName.DATA,
			(objectStore) => objectStore.delete(storageKey)
		);
	},

	bake(options) {
		return bake(this, options);
	},
};
