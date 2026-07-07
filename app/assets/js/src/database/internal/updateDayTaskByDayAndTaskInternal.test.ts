import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getDayTaskForDayAndTaskInternal } from './getDayTaskForDayAndTaskInternal';

import { updateDayTaskByDayAndTaskInternal } from './updateDayTaskByDayAndTaskInternal';

describe('updateDayTaskByDayAndTaskInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.DAY_TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');
	});

	test('updates a specified day task, and returns a promise that resolves to its ID', async () => {
		const result = await updateDayTaskByDayAndTaskInternal(transaction, {
			day: 1,
			task: 1,
			note: 'Updated note',
			summary: 'Updated summary',
			status: 3,
		});

		expect(result).toBe(1);

		const updatedDayTask = await getDayTaskForDayAndTaskInternal(transaction, {
			day: 1,
			task: 1,
		});

		expect(updatedDayTask).toEqual({
			id: 1,
			day: 1,
			task: 1,
			note: 'Updated note',
			summary: 'Updated summary',
			status: 3,
			sortIndex: 1,
		} satisfies Awaited<ReturnType<typeof getDayTaskForDayAndTaskInternal>>);
	});

	test('throws an error if the day task doesn\'t exist', async () => {
		await expect(updateDayTaskByDayAndTaskInternal(transaction, {
			day: -1,
			task: 0,
			note: 'Note',
		})).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if the day task is given a status that doesn\'t exist', async () => {
		await expect(updateDayTaskByDayAndTaskInternal(transaction, {
			day: 0,
			task: 0,
			status: -1,
		})).rejects.toBeInstanceOf(Error);
	});
});
