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
	let dayOS: IDBObjectStore;
	let dayTaskOS: IDBObjectStore;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.DAY,
			ObjectStoreName.DAY_TASK,
		], 'readwrite');
		dayOS = transaction.objectStore(ObjectStoreName.DAY);
		dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	});

	test('removes a specified day', async () => {
		await removeDayInternal(dayOS, dayTaskOS, 0);

		const days = await getDaysInternal(dayOS);

		expect(days).toEqual([
			{
				id: 2,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 2',
			},
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 1',
			},
		]);
	});

	test('throws an error if the specified day does not exist', async () => {
		const promise = removeDayInternal(dayOS, dayTaskOS, -1);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('removes all day tasks that reference the removed day', async () => {
		await removeDayInternal(dayOS, dayTaskOS, 0);

		const dayTasks = await getDayTasksInternal(dayTaskOS);

		expect(dayTasks).toEqual([]);
	});
});
