import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTask } from '../types';
import { getDatabase } from '../utils';
import { insertTestData } from '../test-utils';
import { ObjectStoreName } from '../metadata';

import { getAllDayTasksInternal } from './getAllDayTasksInternal';

describe('getAllDayTasksInternal', () => {
	beforeAll(() => insertTestData());

	test('returns all tasks', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');

		const tasks = await getAllDayTasksInternal(transaction);

		expect(tasks).toEqual([
			{
				id: 1,
				day: 1,
				task: 1,
				note: 'Note for task 1 day 1',
				summary: 'Summary for task 1 day 1',
				status: 2,
				sortIndex: 1,
			},
			{
				id: 2,
				day: 1,
				task: 2,
				note: 'Note for task 2 day 1',
				summary: 'Summary for task 2 day 1',
				status: 2,
				sortIndex: 0,
			},
		] satisfies DayTask[]);
	});
});
