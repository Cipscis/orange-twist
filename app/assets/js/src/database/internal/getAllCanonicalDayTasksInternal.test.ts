import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { insertTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getAllCanonicalDayTasksInternal } from './getAllCanonicalDayTasksInternal';

describe('getAllCanonicalDayTasksInternal', () => {
	beforeAll(() => insertTestData({
		[ObjectStoreName.DAY_TASK]: {
			3: {
				id: 3,
				day: 2,
				task: 1,
				note: '',
				summary: null,
				status: 3,
				sortIndex: null,
			},
			4: {
				id: 4,
				day: 3,
				task: 2,
				note: '',
				summary: null,
				status: 3,
				sortIndex: null,
			},
		},
	}));

	test('gets all canonical day tasks', async () => {
		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.DAY,
			ObjectStoreName.DAY_TASK,
		], 'readonly');

		const canonicalDayTasks = await getAllCanonicalDayTasksInternal(transaction);

		expect(canonicalDayTasks).toEqual([
			{
				id: 3,
				task: 1,
				day: 2,
				note: '',
				summary: null,
				status: 3,
				sortIndex: null,
			},
			{
				id: 2,
				task: 2,
				day: 1,
				note: 'Note for task 2 day 1',
				summary: 'Summary for task 2 day 1',
				status: 2,
				sortIndex: 0,
			},
		]);
	});
});
