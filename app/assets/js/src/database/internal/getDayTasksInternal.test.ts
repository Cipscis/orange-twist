import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';
import { ObjectStoreName } from 'database/metadata';
import { createTestData } from 'database/test-utils';
import { getDatabase } from 'utils/indexedDB';
import { getDayTasksInternal } from './getDayTasksInternal';

describe('getDayTasksInternal', () => {
	beforeAll(() => createTestData());

	test('returns all day tasks in sorted order', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

		const dayTasks = await getDayTasksInternal(dayTaskOS);

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
