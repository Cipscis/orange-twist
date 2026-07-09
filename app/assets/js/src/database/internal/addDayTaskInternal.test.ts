import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getDayTaskForDayAndTaskInternal } from './getDayTaskForDayAndTaskInternal';

import { addDayTaskInternal } from './addDayTaskInternal';

describe('addDayTaskInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.DAY_TASK,
			ObjectStoreName.DAY,
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');
	});

	test('inserts a new day task into the database, and returns its ID', async () => {
		const dayTaskId = await addDayTaskInternal(
			transaction,
			{
				day: 1,
				task: 3,
				note: 'Note for task 3 day 1',
				summary: 'Summary for task 3 day 1',
				status: 2,
				sortIndex: null,
			},
		);

		expect(dayTaskId).toBe(3);

		const dayTask = await getDayTaskForDayAndTaskInternal(transaction, {
			day: 1,
			task: 3,
		});

		expect(dayTask).toEqual({
			id: 3,
			day: 1,
			task: 3,
			note: 'Note for task 3 day 1',
			summary: 'Summary for task 3 day 1',
			status: 2,
			sortIndex: null,
		} satisfies Awaited<ReturnType<typeof getDayTaskForDayAndTaskInternal>>);
	});

	test('fills in blanks with default values', async () => {
		await addDayTaskInternal(
			transaction,
			{
				day: 1,
				task: 3,
			},
		);

		const dayTask = await getDayTaskForDayAndTaskInternal(transaction, {
			day: 1,
			task: 3,
		});

		expect(dayTask).toEqual({
			id: 3,
			day: 1,
			task: 3,
			note: '',
			summary: null,
			status: 1,
			sortIndex: null,
		} satisfies Awaited<ReturnType<typeof getDayTaskForDayAndTaskInternal>>);
	});

	test('throws an error if a day task already exists for that day and task combination', async () => {
		const promise = addDayTaskInternal(
			transaction,
			{
				day: 1,
				task: 2,
				note: 'Note for task 2 day 1',
				summary: 'Summary for task 2 day 1',
				status: 2,
				sortIndex: null,
			},
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if no day exists with the specified day ID', async () => {
		const promise = addDayTaskInternal(
			transaction,
			{
				day: 1,
				task: -1,
				note: 'Note for task -1 day 1',
				summary: 'Summary for task -1 day 1',
				status: 2,
				sortIndex: null,
			},
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if no task exists with the specified task ID', async () => {
		const promise = addDayTaskInternal(
			transaction,
			{
				day: 1,
				task: -1,
				note: 'Note for task -1 day 1',
				summary: 'Summary for task -1 day 1',
				status: 2,
				sortIndex: null,
			},
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if the day task is given a non-existent status', async () => {
		const promise = addDayTaskInternal(
			transaction,
			{
				day: 1,
				task: 3,
				note: 'Note for task 3 day 1',
				summary: 'Summary for task 3 day 1',
				status: -1,
				sortIndex: null,
			}
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
