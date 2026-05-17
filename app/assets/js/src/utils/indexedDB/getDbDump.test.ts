import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { getIdbRequestPromise } from './getIdbRequestPromise';

import { getDbDump } from './getDbDump';

describe('getDbDump', () => {
	test('returns an object that contains a database\'s entire data', async () => {
		// Create some test data in a test database
		const openRequest = indexedDB.open('test', 1);
		openRequest.addEventListener('upgradeneeded', () => {
			openRequest.result.createObjectStore('object-store-a', { keyPath: 'id' });
			openRequest.result.createObjectStore('object-store-b', { keyPath: 'id' });
		});
		const db = await getIdbRequestPromise(openRequest);
		const transaction = db.transaction([
			'object-store-a',
			'object-store-b',
		], 'readwrite');
		const osA = transaction.objectStore('object-store-a');
		const osB = transaction.objectStore('object-store-b');

		await getIdbRequestPromise(osA.add({
			id: 1,
			value: 'test',
		}));
		await getIdbRequestPromise(osA.add({
			id: 2,
			value: 'test 2',
		}));

		await getIdbRequestPromise(osB.add({
			id: 'test',
			value: 1,
		}));
		await getIdbRequestPromise(osB.add({
			id: 'test 2',
			value: 2,
		}));

		db.close();

		const dump = await getDbDump('test', 1);

		expect(dump).toEqual({
			'object-store-a': {
				[1]: { id: 1, value: 'test' },
				[2]: { id: 2, value: 'test 2' },
			},
			'object-store-b': {
				test: { id: 'test', value: 1 },
				'test 2': { id: 'test 2', value: 2},
			},
		});
	});

	test('throws an error if a key is encountered that cannot be an object property key', async () => {
		// Create some test data in a test database
		const openRequest = indexedDB.open('test', 1);
		openRequest.addEventListener('upgradeneeded', () => {
			openRequest.result.createObjectStore('object-store-a', { keyPath: 'id' });
		});
		const db = await getIdbRequestPromise(openRequest);
		const transaction = db.transaction([
			'object-store-a',
		], 'readwrite');
		const osA = transaction.objectStore('object-store-a');

		await getIdbRequestPromise(osA.add({
			id: new Date(),
			value: 'test',
		}));

		db.close();

		const dumpPromise = getDbDump('test', 1);

		await expect(dumpPromise).rejects.toBeInstanceOf(Error);
	});
});
