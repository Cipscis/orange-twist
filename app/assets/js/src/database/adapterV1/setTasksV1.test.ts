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
import { getDayTasksInternal, getTasksInternal } from '../internal';

import { setTasksV1 } from './setTasksV1';

describe('setTasksV1', () => {
	beforeEach(() => createTestData());

	test('adds new tasks', async () => {
		// Start from a blank slate - remove all days and day tasks
		const db = await getDatabase();
		const writeTransaction = db.transaction(ObjectStoreName.TASK, 'readwrite');
		const writeTaskOS = writeTransaction.objectStore(ObjectStoreName.TASK);
		await getIdbRequestPromise(writeTaskOS.clear());

		await setTasksV1([
			[1, {
				id: 1,
				name: 'Task 1',
				note: 'Note for task 1',
				status: 'todo',
				sortIndex: 0,
			}],
			[2, {
				id: 2,
				name: 'Task 2',
				note: 'Note for task 2',
				status: 'todo',
				sortIndex: 1,
			}],
		]);

		const readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const tasks = await getTasksInternal(readTransaction);
		expect(tasks).toEqual([
			{
				id: 1,
				name: 'Task 1',
				note: 'Note for task 1',
				status: 1,
				sortIndex: 0,
			},
			{
				id: 2,
				name: 'Task 2',
				note: 'Note for task 2',
				status: 1,
				sortIndex: 1,
			},
		]);
	});

	test('updates existing tasks', async () => {
		await setTasksV1([
			[1, {
				id: 1,
				name: 'Test task 1 updated',
				note: 'Test task 1 note updated',
				status: 'completed',
				sortIndex: 0,
			}],
			[2, {
				id: 2,
				name: 'Test task 2 updated',
				note: 'Test task 2 note updated',
				status: 'completed',
				sortIndex: 1,
			}],
			[3, {
				id: 3,
				name: 'Test task 3 updated',
				note: 'Test task 3 note updated',
				status: 'completed',
				sortIndex: 2,
			}],
		]);

		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK, 'readonly');

		const tasks = await getTasksInternal(transaction);
		expect(tasks).toEqual([
			{
				id: 1,
				name: 'Test task 1 updated',
				note: 'Test task 1 note updated',
				status: 3,
				sortIndex: 0,
			},
			{
				id: 2,
				name: 'Test task 2 updated',
				note: 'Test task 2 note updated',
				status: 3,
				sortIndex: 1,
			},
			{
				id: 3,
				name: 'Test task 3 updated',
				note: 'Test task 3 note updated',
				status: 3,
				sortIndex: 2,
			},
		]);
	});

	test('throws an error if a task is given a non-existent status', async () => {
		const promise = setTasksV1([
			[1, {
				id: 1,
				name: 'Test task 1 updated',
				note: 'Test task 1 note updated',
				status: 'completed',
				sortIndex: 0,
			}],
			[2, {
				id: 2,
				name: 'Test task 2 updated',
				note: 'Test task 2 note updated',
				status: 'completed',
				sortIndex: 1,
			}],
			[3, {
				id: 3,
				name: 'Test task 3 updated',
				note: 'Test task 3 note updated',
				/* @ts-expect-error Testing invalid status */
				status: 'no-status-exists',
				sortIndex: 2,
			}],
		]);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('removes removed tasks', async () => {
		await setTasksV1([]);

		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK, 'readonly');

		const tasks = await getTasksInternal(transaction);
		expect(tasks).toEqual([]);
	});

	test('removes removed tasks\' day tasks', async () => {
		await setTasksV1([]);

		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');

		const dayTasks = await getDayTasksInternal(transaction);
		expect(dayTasks).toEqual([]);
	});
});
