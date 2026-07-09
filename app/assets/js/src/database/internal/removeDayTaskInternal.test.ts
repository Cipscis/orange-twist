import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { removeDayTaskInternal } from './removeDayTaskInternal';
import { getDayTasksInternal } from './getDayTasksInternal';

describe('removeDayTaskInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readwrite');
	});

	test('removes a specified day task', async () => {
		await removeDayTaskInternal(transaction, 1);

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

	test('throws an error if the specified day task does not exist', async () => {
		const promise = removeDayTaskInternal(transaction, -1);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
