import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTask } from '../types';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { insertTestData } from '../test-utils';

import { getDayTasksInternal } from './getDayTasksInternal';

describe('getDayTasksInternal', () => {
	beforeAll(() => insertTestData());

	test('returns all day tasks in sorted order', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');

		const dayTasks = await getDayTasksInternal(transaction);

		expect(dayTasks).toEqual([
			{
				id: 2,
				day: 1,
				task: 2,
				note: 'Note for task 2 day 1',
				summary: 'Summary for task 2 day 1',
				status: 2,
				sortIndex: 0,
			},
			{
				id: 1,
				day: 1,
				task: 1,
				note: 'Note for task 1 day 1',
				summary: 'Summary for task 1 day 1',
				status: 2,
				sortIndex: 1,
			},
		] satisfies DayTask[]);
	});
});
