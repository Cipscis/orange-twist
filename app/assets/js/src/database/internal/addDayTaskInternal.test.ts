import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from 'database/metadata';

import { getDayTaskForDayAndTaskInternal } from './getDayTaskForDayAndTaskInternal';

import { addDayTaskInternal } from './addDayTaskInternal';

describe('addDayTaskInternal', () => {
	let dayTaskOS: IDBObjectStore;
	let dayOS: IDBObjectStore;
	let taskOS: IDBObjectStore;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.DAY_TASK,
			ObjectStoreName.DAY,
			ObjectStoreName.TASK,
		], 'readwrite');
		dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
		dayOS = transaction.objectStore(ObjectStoreName.DAY);
		taskOS = transaction.objectStore(ObjectStoreName.TASK);
	});

	test('inserts a new day task into the database, and returns its ID', async () => {
		const dayTaskId = await addDayTaskInternal(
			dayTaskOS,
			dayOS,
			taskOS,
			{
				day: 0,
				task: 2,
				note: 'Note for task 2 day 0',
				summary: 'Summary for task 2 day 0',
				status: 1,
				sortIndex: null,
			},
		);

		expect(dayTaskId).toBe(2);

		const dayTask = await getDayTaskForDayAndTaskInternal(dayTaskOS, {
			day: 0,
			task: 2,
		});

		expect(dayTask).toEqual({
			id: 2,
			day: 0,
			task: 2,
			note: 'Note for task 2 day 0',
			summary: 'Summary for task 2 day 0',
			status: 1,
			sortIndex: null,
		});
	});

	test('throws an error if a day task already exists for that day and task combination', async () => {
		const promise = addDayTaskInternal(
			dayTaskOS,
			dayOS,
			taskOS,
			{
				day: 0,
				task: 1,
				note: 'Note for task 1 day 0',
				summary: 'Summary for task 1 day 0',
				status: 1,
				sortIndex: null,
			},
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if no day exists with the specified day ID', async () => {
		const promise = addDayTaskInternal(
			dayTaskOS,
			dayOS,
			taskOS,
			{
				day: 0,
				task: -1,
				note: 'Note for task -1 day 0',
				summary: 'Summary for task -1 day 0',
				status: 1,
				sortIndex: null,
			},
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if no task exists with the specified task ID', async () => {
		const promise = addDayTaskInternal(
			dayTaskOS,
			dayOS,
			taskOS,
			{
				day: 0,
				task: -1,
				note: 'Note for task -1 day 0',
				summary: 'Summary for task -1 day 0',
				status: 1,
				sortIndex: null,
			},
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
