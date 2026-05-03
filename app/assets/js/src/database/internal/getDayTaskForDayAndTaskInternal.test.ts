import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getDayTaskForDayAndTaskInternal } from './getDayTaskForDayAndTaskInternal';

describe('getDayTaskForDayAndTaskInternal', () => {
	beforeAll(() => createTestData());

	test('receives a day task by its day and task', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK);
		const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

		const dayTask = await getDayTaskForDayAndTaskInternal(
			dayTaskOS,
			{
				day: 0,
				task: 1,
			},
		);

		expect(dayTask).toEqual({
			id: 1,
			day: 0,
			task: 1,
			note: 'Note for task 1 day 0',
			summary: 'Summary for task 1 day 0',
			status: 1,
			sortIndex: 0,
		});
	});

	test('returns null if no such day exists', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK);
		const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

		const dayTask = await getDayTaskForDayAndTaskInternal(
			dayTaskOS,
			{
				day: -1,
				task: -1,
			}
		);

		expect(dayTask).toBeNull();
	});
});
