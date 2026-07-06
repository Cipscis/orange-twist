import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getDaysInternal } from './getDaysInternal';
import { getDayTasksInternal } from './getDayTasksInternal';

import { removeDayInternal } from './removeDayInternal';

describe('removeDayInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.DAY,
			ObjectStoreName.DAY_TASK,
		], 'readwrite');
	});

	test('removes a specified day', async () => {
		await removeDayInternal(transaction, 1);

		const days = await getDaysInternal(transaction);

		expect(days).toEqual([
			{
				id: 3,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 3',
			},
			{
				id: 2,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 2',
			},
		] satisfies Awaited<ReturnType<typeof getDaysInternal>>);
	});

	test('throws an error if the specified day does not exist', async () => {
		const promise = removeDayInternal(transaction, -1);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('removes all day tasks that reference the removed day', async () => {
		await removeDayInternal(transaction, 1);

		const dayTasks = await getDayTasksInternal(transaction);

		expect(dayTasks).toEqual([]);
	});
});
