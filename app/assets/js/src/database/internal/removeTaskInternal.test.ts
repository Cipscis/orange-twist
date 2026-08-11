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
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.DAY_TASK,
		], 'readwrite');
	});

	test('removes a specified task', async () => {
		await removeTaskInternal(transaction, 1);

		const tasks = await getTasksInternal(transaction);

		expect(tasks).toEqual([
			{
				id: 3,
				name: 'Test task 3',
				note: 'Test task 3 note',
				sortIndex: 0,
			},
			{
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				sortIndex: 2,
			},
		] satisfies Awaited<ReturnType<typeof getTasksInternal>>);
	});

	test('throws an error if the specified task does not exist', async () => {
		const promise = removeTaskInternal(transaction, -1);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('removes all day tasks that reference the removed task', async () => {
		await removeTaskInternal(transaction, 1);

		const dayTasks = await getDayTasksInternal(transaction);

		expect(dayTasks).toEqual([
			{
				id: 2,
				day: 1,
				task: 2,
				note: 'Note for task 2 day 1',
				summary: 'Summary for task 2 day 1',
				status: 2,
				sortIndex: 0,
			},
		] satisfies Awaited<ReturnType<typeof getDayTasksInternal>>);
	});
});
