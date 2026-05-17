import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { getIdbRequestPromise } from 'utils';

import { dbName } from '../metadata';

import { getDatabaseVersion } from './getDatabaseVersion';

describe('getDatabaseVersion', () => {
	test('if the database does not exist, returns the intended version', async () => {
		await expect(getDatabaseVersion()).resolves.toBe(2);
	});

	test('if the database does exist, returns the actual version', async () => {
		const openPromise = getIdbRequestPromise(indexedDB.open(dbName, 1));
		await expect(openPromise).resolves.toBeInstanceOf(IDBDatabase);

		await expect(getDatabaseVersion()).resolves.toBe(1);
	});
});
