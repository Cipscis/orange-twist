import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { createTestData } from '../test-utils';
import { ObjectStoreName } from '../metadata';

import { getTasksInternal } from './getTasksInternal';

describe('getTasksInternal', () => {
	beforeAll(() => createTestData());

	test('returns all tasks', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK, 'readonly');

		const tasks = await getTasksInternal(transaction);

		expect(tasks).toEqual([
			{
				id: 3,
				name: 'Test task 3',
				note: 'Test task 3 note',
				sortIndex: 0,
			},
			{
				id: 1,
				name: 'Test task 1',
				note: 'Test task 1 note',
				sortIndex: 1,
			},
			{
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				sortIndex: 2,
			},
		] satisfies Awaited<ReturnType<typeof getTasksInternal>>);
	});
});
