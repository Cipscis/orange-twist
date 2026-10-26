import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { Task } from '../types';
import { getDatabase } from '../utils';
import { insertTestData } from '../test-utils';
import { ObjectStoreName } from '../metadata';

import { getTasksInternal } from './getTasksInternal';

describe('getTasksInternal', () => {
	beforeAll(() => insertTestData());

	test('returns tasks for the provided IDs in order', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK, 'readonly');

		const tasks = await getTasksInternal(transaction, [2, 1, -1, 2]);

		expect(tasks).toEqual([
			{
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				sortIndex: 2,
			},
			{
				id: 1,
				name: 'Test task 1',
				note: 'Test task 1 note',
				sortIndex: 1,
			},
			null,
			{
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				sortIndex: 2,
			},
		] satisfies (Task | null)[]);
	});
});
