import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';

import { getDayTasksInternal } from './getDayTasksInternal';

describe('getDayTasksInternal', () => {
	beforeAll(() => createTestData());

	test('returns all day tasks in sorted order', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');

		const dayTasks = await getDayTasksInternal(transaction);

		expect(dayTasks).toEqual([
			{
				id: 1,
				day: 0,
				task: 1,
				note: 'Note for task 1 day 0',
				summary: 'Summary for task 1 day 0',
				status: 1,
				sortIndex: 0,
			},
			{
				id: 0,
				day: 0,
				task: 0,
				note: 'Note for task 0 day 0',
				summary: 'Summary for task 0 day 0',
				status: 1,
				sortIndex: 1,
			},
		]);
	});
});
