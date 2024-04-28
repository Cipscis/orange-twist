import type { ObjectStoreName } from './ObjectStoreName';
import { getDatabase } from './getDatabase';

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
	objectStoreName: ObjectStoreName,
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
