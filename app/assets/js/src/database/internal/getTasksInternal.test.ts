import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from 'database/test-utils';

import { getTasksInternal } from './getTasksInternal';
import { getDatabase } from 'utils/indexedDB';
import { ObjectStoreName } from 'database/metadata';

describe('getTasksInternal', () => {
	beforeAll(() => createTestData());

	test('returns all tasks', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK, 'readonly');
		const tasksOS = transaction.objectStore(ObjectStoreName.TASK);

		const tasks = await getTasksInternal(tasksOS);

		expect(tasks).toEqual([
			{
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				status: 1,
				sortIndex: 0,
			},
			{
				id: 0,
				name: 'Test task 0',
				note: 'Test task 0 note',
				status: 0,
				sortIndex: 1,
			},
			{
				id: 1,
				name: 'Test task 1',
				note: 'Test task 1 note',
				status: 1,
				sortIndex: 2,
			},
		]);
	});
});
