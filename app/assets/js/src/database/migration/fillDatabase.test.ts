import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDbDump, getIterableCursor } from 'utils';

import type { DatabaseData } from '../types';
import { getDatabase } from '../utils';
import {
	dbName,
	dbVersion,
	ObjectStoreName,
} from '../metadata';

import { fillDatabase } from './fillDatabase';

describe('fillDatabase', () => {
	test('fills an Orange Twist database with data', async () => {
		const db = await getDatabase();

		// Clear minimal status data first
		const clearTransaction = db.transaction([ObjectStoreName.STATUS], 'readwrite');
		const clearStatusOS = clearTransaction.objectStore(ObjectStoreName.STATUS);
		for await (const cursor of getIterableCursor(clearStatusOS)) {
			cursor.delete();
		}

		await fillDatabase(db, {
			[ObjectStoreName.DAY]: {
				1: {
					id: 1,
					year: 2026,
					month: 7,
					day: 9,
					note: 'Note',
				},
			},
			[ObjectStoreName.TASK]: {
				1: {
					id: 1,
					name: 'Task',
					note: 'Task note',
					sortIndex: null,
				},
			},
			[ObjectStoreName.DAY_TASK]: {
				1: {
					id: 1,
					day: 1,
					task: 1,
					summary: 'Day task summary',
					note: 'Day task note',
					status: 1,
					sortIndex: null,
				},
			},
			[ObjectStoreName.STATUS]: {
				1: {
					id: 1,
					alias: 'todo',
				},
			},
			[ObjectStoreName.TEMPLATE]: {
				1: {
					id: 1,
					name: 'Template',
					template: 'template',
					sortIndex: null,
				},
			},
			[ObjectStoreName.IMAGE]: {},
		});

		const dump = await getDbDump(dbName, dbVersion);

		expect(dump).toEqual({
			[ObjectStoreName.DAY]: {
				1: {
					id: 1,
					year: 2026,
					month: 7,
					day: 9,
					note: 'Note',
				},
			},
			[ObjectStoreName.TASK]: {
				1: {
					id: 1,
					name: 'Task',
					note: 'Task note',
					sortIndex: null,
				},
			},
			[ObjectStoreName.DAY_TASK]: {
				1: {
					id: 1,
					day: 1,
					task: 1,
					summary: 'Day task summary',
					note: 'Day task note',
					status: 1,
					sortIndex: null,
				},
			},
			[ObjectStoreName.STATUS]: {
				1: {
					id: 1,
					alias: 'todo',
				},
			},
			[ObjectStoreName.TEMPLATE]: {
				1: {
					id: 1,
					name: 'Template',
					template: 'template',
					sortIndex: null,
				},
			},
			[ObjectStoreName.IMAGE]: {},
		} satisfies DatabaseData);
	});
});
