import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDbDump } from 'utils';

import {
	dbName,
	dbVersion,
	ObjectStoreName,
} from '../metadata';
import { clearDatabase, createTestData } from '../test-utils';
import type { DatabaseData } from '../types';

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

	test('retains any existing data stored in the database v2', async () => {
		await createTestData();
		const dbToClose = await getDatabase();
		dbToClose.close();

		const dbToRead = await getDatabase();
		const dbDump = await getDbDump(dbToRead.name, dbToRead.version);

		expect(dbDump.day).toEqual({
			0: {
				id: 0,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note 0',
			},
			1: {
				id: 1,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 1',
			},
			2: {
				id: 2,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 2',
			},
		});

		expect(dbDump.day_task).toEqual({
			0: {
				id: 0,
				day: 0,
				task: 0,
				note: 'Note for task 0 day 0',
				summary: 'Summary for task 0 day 0',
				status: 1,
				sortIndex: 1,
			},
			1: {
				id: 1,
				day: 0,
				task: 1,
				note: 'Note for task 1 day 0',
				summary: 'Summary for task 1 day 0',
				status: 1,
				sortIndex: 0,
			},
		});

		// Can't easily compare image dump due to Blob handling, so remove Blobs first
		const imageDumpWithoutBlobs = Object.fromEntries(
			Object.entries(dbDump.image).map(
				([key, value]) => {
					const {
						file,
						...rest
					} = value as DatabaseData[typeof ObjectStoreName.IMAGE][string];

					return [key, rest];
				}
			)
		);
		expect(imageDumpWithoutBlobs).toEqual({
			'test-hash': {
				hash: 'test-hash',
			},
		});

		expect(dbDump.status).toEqual({
			0: {
				id: 0,
				name: 'todo',
				isComplete: false,
			},
			1: {
				id: 1,
				name: 'in-progress',
				isComplete: false,
			},
			2: {
				id: 2,
				name: 'completed',
				isComplete: true,
			},
		});

		expect(dbDump.task).toEqual({
			0: {
				id: 0,
				name: 'Test task 0',
				note: 'Test task 0 note',
				status: 0,
				sortIndex: 1,
			},
			1: {
				id: 1,
				name: 'Test task 1',
				note: 'Test task 1 note',
				status: 1,
				sortIndex: 2,
			},
			2: {
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				status: 1,
				sortIndex: 0,
			},
		});

		expect(dbDump.template).toEqual({
			0: {
				id: 0,
				name: 'Template 0 name',
				template: 'Template 0',
				sortIndex: 1,
			},
			1: {
				id: 1,
				name: 'Template 1 name',
				template: 'Template 1',
				sortIndex: 0,
			},
		});
	});
});
