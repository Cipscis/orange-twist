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

	test('updates any existing data from Orange Twist v1.5.0 or lower', async () => {
		// Orange Twist 1.5.0 includes templates, still has all main data in local storage, and has images in a IndexedDB database
		localStorage.setItem('days', '[["2026-05-17",{"name":"2026-05-17","note":"Day 1 note","tasks":[1,2]}]]');
		localStorage.setItem('tasks', '[[1,{"id":1,"name":"Test task 1","status":"todo","note":"Test task 1 note","sortIndex":-1}],[2,{"id":2,"name":"Test task 2","status":"in-progress","note":"Task 2 note","sortIndex":-2}]]');
		localStorage.setItem('day-tasks', '[["2026-05-17_1",{"dayName":"2026-05-17","taskId":1,"status":"todo","note":"Day task for task 1 day 1 note","summary":"Day task for task 1 day 1 summary"}],["2026-05-17_2",{"dayName":"2026-05-17","taskId":2,"status":"in-progress","note":"Day task for task 2 day 1 note","summary":"Day task for task 2 day 1 summary"}]]');
		localStorage.setItem('templates', '[[1,{"id":1,"name":"Template 1 name","template":"Template 1","sortIndex":-1}]]');

		// TODO: Add images

		const dbToRead = await getDatabase();
		const dbDump = await getDbDump(dbToRead.name, dbToRead.version);

		console.log(dbDump);
		expect(dbDump).toEqual({
			day: {
				1: {
					id: 1,
					year: 2026,
					month: 5,
					day: 17,
					note: 'Day 1 note',
				},
			},
			task: {
				1: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					status: 1,
					sortIndex: -1,
				},
				2: {
					id: 2,
					name: 'Test task 2',
					note: 'Test task 2 note',
					status: 2,
					sortIndex: -2,
				},
			},
			day_task: {
				1: {
					id: 1,
					day: 1,
					task: 1,
					note: 'Day task for task 1 day 1 note',
					summary: 'Day task for task 1 day 1 summary',
					status: 1,
					sortIndex: 0,
				},
				2: {
					id: 2,
					day: 2,
					task: 2,
					note: 'Day task for task 2 day 1 note',
					summary: 'Day task for task 2 day 1 note',
					status: 2,
					sortIndex: 1,
				},
			},
			status: {
				1: {
					id: 1,
					name: 'todo',
					isComplete: false,
				},
				2: {
					id: 2,
					name: 'in-progress',
					isComplete: false,
				},
				3: {
					id: 3,
					name: 'completed',
					isComplete: false,
				},

				4: {
					id: 4,
					name: 'investigating',
					isComplete: false,
				},
				5: {
					id: 5,
					name: 'in-review',
					isComplete: false,
				},
				6: {
					id: 6,
					name: 'ready-to-test',
					isComplete: false,
				},
				7: {
					id: 7,
					name: 'paused',
					isComplete: false,
				},
				8: {
					id: 8,
					name: 'approved-to-deploy',
					isComplete: false,
				},
				9: {
					id: 9,
					name: 'will-not-do',
					isComplete: false,
				},
			},
			template: {
				1: {
					id: 1,
					name: 'Template 1 name',
					template: 'Template 1',
					sortIndex: -1,
				},
			},
			image: {},
		});
	});

	test.todo('updates any existing data stored in the database v1');

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
			},
			task: {
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
			},
			day_task: {
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
			},
			status: {
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
			},
			template: {
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
			}
		});

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
