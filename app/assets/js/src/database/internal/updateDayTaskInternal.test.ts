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

import { updateDayTaskInternal } from './updateDayTaskInternal';

describe('updateDayTaskInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.DAY_TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');
	});

	test('updates a specified day task', async () => {
		const result = await updateDayTaskInternal(transaction, {
			day: 0,
			task: 0,
			note: 'Updated note',
			summary: 'Updated summary',
			status: 2,
		});

		expect(result).toBeUndefined();

		const updatedDayTask = await getDayTaskForDayAndTaskInternal(transaction, {
			day: 0,
			task: 0,
		});

		expect(updatedDayTask).toEqual({
			id: 0,
			day: 0,
			task: 0,
			note: 'Updated note',
			summary: 'Updated summary',
			status: 2,
			sortIndex: 1,
		});
	});

	test.todo('throws an error if the day task doesn\'t exist');

	test.todo('throws an error if the day task is given a status that doesn\'t exist');
});
