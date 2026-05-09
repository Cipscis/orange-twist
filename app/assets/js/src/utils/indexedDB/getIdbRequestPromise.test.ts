import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import { getIdbRequestPromise } from './getIdbRequestPromise';

describe('getIdbRequestPromise', () => {
	let db: IDBDatabase;

	beforeEach(() => {
		return new Promise((resolve, reject) => {
			const dbOpenRequest = indexedDB.open('test', 1);

			dbOpenRequest.addEventListener('upgradeneeded', () => {
				const db = dbOpenRequest.result;
				db.createObjectStore('test', {
					keyPath: 'id',
					autoIncrement: true,
				});
			});

			dbOpenRequest.addEventListener('success', () => {
				db = dbOpenRequest.result;
				resolve(db);
			});

			dbOpenRequest.addEventListener('error', () => reject(dbOpenRequest.error ?? new Error('Could not open database')));
			dbOpenRequest.addEventListener('blocked', () => reject(dbOpenRequest.error ?? new Error('Could not open database')));
		});
	});

	afterEach(() => {
		db.close();
		indexedDB.deleteDatabase('test');
	});

	test('returns a Promise which resolves when the request completes', async () => {
		const transaction = db.transaction('test', 'readwrite');
		const testOS = transaction.objectStore('test');

		const promise = getIdbRequestPromise(testOS.add({ id: 1 }));

		await expect(promise).resolves.toBe(1);
	});

	test('returns a Promise which rejects when the request fails', async () => {
		const transaction = db.transaction('test', 'readwrite');
		const testOS = transaction.objectStore('test');

		const promise = getIdbRequestPromise(testOS.add({ id: 1 }));
		transaction.abort();

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise which resolves if the request has already completed', async () => {
		const transaction = db.transaction('test', 'readwrite');
		const testOS = transaction.objectStore('test');

		const request = testOS.add({ id: 1 });
		await getIdbRequestPromise(request);
		const promise = getIdbRequestPromise(request);

		await expect(promise).resolves.toBe(1);
	});

	test('returns a Promise which rejects if the request has already failed', async () => {
		const transaction = db.transaction('test', 'readwrite');
		const testOS = transaction.objectStore('test');

		const request = testOS.add({ id: 1 });

		// Wait for the transaction to be aborted before creating the promise
		await abortTransaction(transaction);
		const promise = getIdbRequestPromise(request);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});

/**
 * Asynchronously aborts an {@linkcode IDBTransaction} and returns a {@linkcode Promise} that resolves when the transaction has been aborted.
 */
function abortTransaction(transaction: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		transaction.addEventListener('abort', () => resolve());
		transaction.abort();
	});
}
