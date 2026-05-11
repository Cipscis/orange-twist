import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getIdbRequestPromise } from 'utils';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';

import { setTasksV1 } from './setTasksV1';
import { getTasksInternal } from 'database/internal';

describe('setTasksV1', () => {
	beforeEach(() => createTestData());

	test('adds new tasks', async () => {
		// Start from a blank slate - remove all days and day tasks
		const db = await getDatabase();
		const writeTransaction = db.transaction(
			[ObjectStoreName.TASK],
			'readwrite'
		);
		const writeTaskOS = writeTransaction.objectStore(ObjectStoreName.TASK);
		await getIdbRequestPromise(writeTaskOS.clear());

		await setTasksV1([
			[0, {
				id: 0,
				name: 'Task 0',
				note: 'Note for task 0',
				status: 'todo',
				sortIndex: 0,
			}],
			[1, {
				id: 1,
				name: 'Task 1',
				note: 'Note for task 1',
				status: 'todo',
				sortIndex: 1,
			}],
		]);

		const readTransaction = db.transaction(
			[ObjectStoreName.TASK],
			'readonly'
		);
		const readTaskOS = readTransaction.objectStore(ObjectStoreName.TASK);
		const tasks = await getTasksInternal(readTaskOS);
		expect(tasks).toEqual([
			{
				id: 0,
				name: 'Task 0',
				note: 'Note for task 0',
				status: 0,
				sortIndex: 0,
			},
			{
				id: 1,
				name: 'Task 1',
				note: 'Note for task 1',
				status: 0,
				sortIndex: 1,
			},
		]);
	});

	test.todo('updates existing tasks');

	test.todo('throws an error if a task is given a non-existent status');

	test.todo('removes removed tasks');

	test.todo('removes existing tasks\' day tasks');
});
