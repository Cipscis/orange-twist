import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getTaskInternal } from './getTaskInternal';

describe('getTaskInternal', () => {
	beforeAll(() => createTestData());

	test('returns a task with the specified task ID', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK);

		const task = await getTaskInternal(transaction, 1);

		expect(task).toEqual({
			id: 1,
			name: 'Test task 1',
			note: 'Test task 1 note',
			status: 1,
			sortIndex: 1,
		});
	});

	test('returns null if no task exists by that task ID', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK);

		const task = await getTaskInternal(transaction, -1);

		expect(task).toBeNull();
	});
});
