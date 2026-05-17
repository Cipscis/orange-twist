import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	dbName,
	dbVersion,
	ObjectStoreName,
} from '../metadata';
import { clearDatabase } from '../test-utils';

import { getDatabase } from './getDatabase';

describe('getDatabase', () => {
	beforeEach(() => clearDatabase());

	test('creates the database if it doesn\'t already exist', async () => {
		const db = await getDatabase();

		// Check the right database has been retrieved
		expect(db).toBeInstanceOf(IDBDatabase);
		expect(db.name).toBe(dbName);
		expect(db.version).toBe(dbVersion);

		// Check the database has the right object stores
		const objectStoreNames: string[] = [];
		for (let i = 0; i < db.objectStoreNames.length; i++) {
			objectStoreNames[i] = db.objectStoreNames[i];
		}
		// Looks like these get sorted alphabetically when retrieved this way
		const expectedObjectStoreNames = [
			ObjectStoreName.DAY,
			ObjectStoreName.DAY_TASK,
			ObjectStoreName.IMAGE,
			ObjectStoreName.STATUS,
			ObjectStoreName.TASK,
			ObjectStoreName.TEMPLATE,
		];

		expect(objectStoreNames).toEqual(expectedObjectStoreNames);
	});

	test('returns a handle to the existing database if it does already exist', async () => {
		const db1 = await getDatabase();
		const db2 = await getDatabase();

		expect(db2).toBe(db1);
	});

	test.todo('updates any existing data stored in localStorage');

	test.todo('updates any existing data stored in the database v1');

	test.todo('retains any existing data stored in the database v2');
});
