import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getIterableCursor } from './getIterableCursor';

describe('getIterableCursor', () => {
	let readTransaction: IDBTransaction;

	beforeAll(() => {
		return new Promise<void>((resolve, reject) => {
			// Construct a database with some test data
			const openDbRequest = indexedDB.open('getIterableCursor.test', 1);

			openDbRequest.addEventListener('upgradeneeded', () => {
				const db = openDbRequest.result;

				const testOS = db.createObjectStore('test', { keyPath: 'key', autoIncrement: true });
				testOS.createIndex('test', 'indexedKey');
			});

			openDbRequest.addEventListener('success', () => {
				const db = openDbRequest.result;

				const transaction = db.transaction('test', 'readwrite');
				const testOS = transaction.objectStore('test');

				for (let i = 0; i < 5; i++) {
					testOS.add({
						indexedKey: 5 - i,
						value: (i+1) * 100,
					});
				}

				readTransaction = db.transaction('test', 'readonly');

				resolve();
			});

			openDbRequest.addEventListener('blocked', () => reject(openDbRequest.error!));
		});
	});

	test('returns an async iterable containing IDBCursorWithValue values', async () => {
		const testOS = readTransaction.objectStore('test');
		const iterableCursor = getIterableCursor(testOS);

		const result = [];
		for await (const cursor of iterableCursor) {
			result.push(cursor.value);
		}

		expect(result).toEqual([
			{
				key: 1,
				indexedKey: 5,
				value: 100,
			},
			{
				key: 2,
				indexedKey: 4,
				value: 200,
			},
			{
				key: 3,
				indexedKey: 3,
				value: 300,
			},
			{
				key: 4,
				indexedKey: 2,
				value: 400,
			},
			{
				key: 5,
				indexedKey: 1,
				value: 500,
			},
		]);
	});

	test('can be provided with a query', async () => {
		const testOS = readTransaction.objectStore('test');
		const iterableCursor = getIterableCursor(testOS, IDBKeyRange.bound(1, 2));

		const result = [];
		for await (const cursor of iterableCursor) {
			result.push(cursor.value);
		}

		expect(result).toEqual([
			{
				key: 1,
				indexedKey: 5,
				value: 100,
			},
			{
				key: 2,
				indexedKey: 4,
				value: 200,
			},
		]);
	});

	test('can be used with an index', async () => {
		const testOS = readTransaction.objectStore('test');
		const testIndex = testOS.index('test');
		const iterableCursor = getIterableCursor(testIndex, 5);

		const result = [];
		for await (const cursor of iterableCursor) {
			result.push(cursor.value);
		}

		expect(result).toEqual([{
			key: 1,
			indexedKey: 5,
			value: 100,
		}]);
	});
});
