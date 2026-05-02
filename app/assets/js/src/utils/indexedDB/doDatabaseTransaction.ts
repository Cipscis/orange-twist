import { getDatabase } from '../../database/utils/getDatabase';
import type { ObjectStoreName } from 'database/metadata';

/**
 * Perform a transaction on a specified object store within
 * Orange Twist's IndexedDB database.
 *
 * @param mode - The {@linkcode IDBTransactionMode} to use for this transaction.
 * @param objectStoreName - The name of the object store the transaction should be against.
 * Use {@linkcode ObjectStoreName} to get valid names.
 * @param callback - The callback to execute against the specified object store.
 *
 * @returns A `Promise` that resolves when the transaction is complete, or rejects if
 * the transaction fails.
 *
 * @example
 * ```typescript
 * await doDatabaseTransaction(
 *     'readwrite',
 *     ObjectStoreName.DATA,
 *     (objectStore) => objectStore.put('some data', 'key')
 * );
 * ```
 */
export function doDatabaseTransaction(
	mode: IDBTransactionMode,
	objectStoreNames: readonly ObjectStoreName[],
	callback: (objectStores: readonly IDBObjectStore[]) => IDBRequest
): Promise<unknown> {
	return new Promise((resolve, reject) => {
		getDatabase().then((db) => {
			const transaction = db.transaction(objectStoreNames, mode);
			const objectStores = objectStoreNames.map(
				(objectStoreName) => transaction.objectStore(objectStoreName)
			);
			const request = callback(objectStores);

			request.addEventListener('success', () => resolve(request.result));
			request.addEventListener('error', () => reject(
				request.error ??
				new Error('Database transaction request encountered an unrecognised error.')
			));
		}).catch(reject);
	});
}
