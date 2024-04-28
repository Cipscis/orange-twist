import type { PersistApi, PersistOptions } from 'persist/PersistApi';
import type { DefaultsFor } from 'utils';
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
 * localStorage API.
 */
export const ls: PersistApi = {
	set(key, data, options) {
		const fullOptions = {
			...defaultOptions,
			...options,
		};
		const storageKey = getStorageKey(key, fullOptions);

		return new Promise((resolve, reject) => {
			try {
				const jsonData = JSON.stringify(data);
				localStorage.setItem(storageKey, jsonData);
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	},

	get(key, options) {
		const fullOptions = {
			...defaultOptions,
			...options,
		};
		const storageKey = getStorageKey(key, fullOptions);

		return new Promise((resolve, reject) => {
			try {
				const jsonData = localStorage.getItem(storageKey);
				if (jsonData === null) {
					resolve(undefined);
					return;
				}
				const data = JSON.parse(jsonData);
				resolve(data);
			} catch (e) {
				reject(e);
			}
		});
	},

	delete(key, options) {
		const fullOptions = {
			...defaultOptions,
			...options,
		};
		const storageKey = getStorageKey(key, fullOptions);

		return new Promise((resolve, reject) => {
			try {
				localStorage.removeItem(storageKey);
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	},

	bake(options) {
		return bake(this, options);
	},
};
