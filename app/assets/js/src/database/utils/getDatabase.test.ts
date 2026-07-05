import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDbDump } from 'utils';

import type { DatabaseData } from '../types';
import {
	dbName,
	dbVersion,
	ObjectStoreName,
} from '../metadata';
import { clearDatabase, createTestData } from '../test-utils';

import { getDatabase } from './getDatabase';

describe('getDatabase', () => {
	beforeEach(async () => {
		localStorage.clear();
		await clearDatabase();
	});

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

	test('retains any existing data stored in the database v2', async () => {
		await createTestData();
		const dbToClose = await getDatabase();
		dbToClose.close();

		const dbToRead = await getDatabase();
		const {
			image: imageDump,
			...dbDump
		} = await getDbDump(dbToRead.name, dbToRead.version);

		expect(dbDump).toEqual({
			day: {
				1: {
					id: 1,
					year: 2026,
					month: 4,
					day: 26,
					note: 'Test note 1',
				},
				2: {
					id: 2,
					year: 2026,
					month: 4,
					day: 27,
					note: 'Test note 2',
				},
				3: {
					id: 3,
					year: 2026,
					month: 1,
					day: 1,
					note: 'Test note 3',
				},
			},
			task: {
				1: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					status: 1,
					sortIndex: 1,
				},
				2: {
					id: 2,
					name: 'Test task 2',
					note: 'Test task 2 note',
					status: 2,
					sortIndex: 2,
				},
				3: {
					id: 3,
					name: 'Test task 3',
					note: 'Test task 3 note',
					status: 2,
					sortIndex: 0,
				},
			},
			day_task: {
				1: {
					id: 1,
					day: 1,
					task: 1,
					note: 'Note for task 1 day 1',
					summary: 'Summary for task 1 day 1',
					status: 2,
					sortIndex: 1,
				},
				2: {
					id: 2,
					day: 1,
					task: 2,
					note: 'Note for task 2 day 1',
					summary: 'Summary for task 2 day 1',
					status: 2,
					sortIndex: 0,
				},
			},
			status: {
				1: {
					id: 1,
					alias: 'todo',
				},
				2: {
					id: 2,
					alias: 'in-progress',
				},
				3: {
					id: 3,
					alias: 'completed',
				},
			},
			template: {
				1: {
					id: 1,
					name: 'Template 1 name',
					template: 'Template 1',
					sortIndex: 1,
				},
				2: {
					id: 2,
					name: 'Template 2 name',
					template: 'Template 2',
					sortIndex: 0,
				},
			},
		} satisfies Partial<DatabaseData>);

		// Can't easily compare image dump due to Blob handling, so remove Blobs first
		const imageDumpWithoutBlobs = Object.fromEntries(
			Object.entries(imageDump).map(
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
	});
});
