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

const dbName = 'orange-twist';
const objectStoreName = 'orange-twist';

let db: IDBDatabase | null = null;
/**
 * Get a handle to the database, opening it if it wasn't
 * already open.
 */
function getDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (db) {
			resolve(db);
			return;
		}

		const request = indexedDB.open(dbName);

		// Create object store when database is first created
		request.addEventListener('upgradeneeded', () => {
			request.result.createObjectStore(objectStoreName);
		});

		// Handle success
		request.addEventListener('success', () => {
			db = request.result;
			resolve(request.result);
		});

		// Handle errors
		request.addEventListener('error', reject);
		request.addEventListener('blocked', reject);
	});
}

/**
 * Handle the repetitive paperwork like starting a transaction
 * and wrapping things in a Promise.
 */
function doTransaction(
	mode: IDBTransactionMode,
	callback: (objectStore: IDBObjectStore) => IDBRequest
): Promise<unknown> {
	return new Promise((resolve, reject) => {
		getDatabase().then((db) => {
			const transaction = db.transaction(objectStoreName, mode);
			const objectStore = transaction.objectStore(objectStoreName);
			const request = callback(objectStore);

			request.addEventListener('success', () => resolve(request.result));
			request.addEventListener('error', () => reject(request.error));
		}).catch(reject);
	});
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

		await doTransaction(
			'readwrite',
			(objectStore) => objectStore.put(data, storageKey)
		);
	},

	get(key, options) {
		const fullOptions = {
			...defaultOptions,
			...options,
		};
		const storageKey = getStorageKey(key, fullOptions);

		return doTransaction(
			'readonly',
			(objectStore) => objectStore.get(storageKey)
		);
	},

	async delete(key, options) {
		const fullOptions = {
			...defaultOptions,
			...options,
		};
		const storageKey = getStorageKey(key, fullOptions);

		await doTransaction(
			'readwrite',
			(objectStore) => objectStore.delete(storageKey)
		);
	},

	bake(options) {
		return bake(this, options);
	},
};
