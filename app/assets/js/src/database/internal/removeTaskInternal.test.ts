import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getTasksInternal } from './getTasksInternal';
import { getDayTasksInternal } from './getDayTasksInternal';

import { removeTaskInternal } from './removeTaskInternal';

describe('removeTaskInternal', () => {
	let taskOS: IDBObjectStore;
	let dayTaskOS: IDBObjectStore;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.DAY_TASK,
		], 'readwrite');
		taskOS = transaction.objectStore(ObjectStoreName.TASK);
		dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	});

	test('removes a specified task', async () => {
		await removeTaskInternal(taskOS, dayTaskOS, 0);

		const tasks = await getTasksInternal(taskOS);

		expect(tasks).toEqual([
			{
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				status: 1,
				sortIndex: 0,
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

	test('throws an error if the specified task does not exist', async () => {
		const promise = removeTaskInternal(taskOS, dayTaskOS, -1);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('removes all day tasks that reference the removed task', async () => {
		await removeTaskInternal(taskOS, dayTaskOS, 0);

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
		]);
	});
});
