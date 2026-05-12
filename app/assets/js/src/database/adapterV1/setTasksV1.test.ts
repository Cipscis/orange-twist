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

	test('updates existing tasks', async () => {
		await setTasksV1([
			[0, {
				id: 0,
				name: 'Test task 0 updated',
				note: 'Test task 0 note updated',
				status: 'completed',
				sortIndex: 0,
			}],
			[1, {
				id: 1,
				name: 'Test task 1 updated',
				note: 'Test task 1 note updated',
				status: 'completed',
				sortIndex: 1,
			}],
			[2, {
				id: 2,
				name: 'Test task 2 updated',
				note: 'Test task 2 note updated',
				status: 'completed',
				sortIndex: 2,
			}],
		]);

		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK, 'readonly');
		const taskOS = transaction.objectStore(ObjectStoreName.TASK);

		const tasks = await getTasksInternal(taskOS);
		expect(tasks).toEqual([
			{
				id: 0,
				name: 'Test task 0 updated',
				note: 'Test task 0 note updated',
				status: 2,
				sortIndex: 0,
			},
			{
				id: 1,
				name: 'Test task 1 updated',
				note: 'Test task 1 note updated',
				status: 2,
				sortIndex: 1,
			},
			{
				id: 2,
				name: 'Test task 2 updated',
				note: 'Test task 2 note updated',
				status: 2,
				sortIndex: 2,
			},
		]);
	});

	test('throws an error if a task is given a non-existent status', async () => {
		const promise = setTasksV1([
			[0, {
				id: 0,
				name: 'Test task 0 updated',
				note: 'Test task 0 note updated',
				status: 'completed',
				sortIndex: 0,
			}],
			[1, {
				id: 1,
				name: 'Test task 1 updated',
				note: 'Test task 1 note updated',
				status: 'completed',
				sortIndex: 1,
			}],
			[2, {
				id: 2,
				name: 'Test task 2 updated',
				note: 'Test task 2 note updated',
				/* @ts-expect-error Testing invalid status */
				status: 'no-status-exists',
				sortIndex: 2,
			}],
		]);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test.todo('removes removed tasks');

	test.todo('removes existing tasks\' day tasks');
});
