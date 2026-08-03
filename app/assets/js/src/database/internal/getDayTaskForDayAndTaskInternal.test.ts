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

		const dayTask = await getDayTaskForDayAndTaskInternal(
			transaction,
			{
				day: 1,
				task: 2,
			},
		);

		expect(dayTask).toEqual({
			id: 2,
			day: 1,
			task: 2,
			note: 'Note for task 2 day 1',
			summary: 'Summary for task 2 day 1',
			status: 2,
			sortIndex: 0,
		} satisfies Awaited<ReturnType<typeof getDayTaskForDayAndTaskInternal>>);
	});

	test('returns null if no such day task exists', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK);

		const dayTask = await getDayTaskForDayAndTaskInternal(
			transaction,
			{
				day: -1,
				task: -1,
			}
		);

		expect(dayTask).toBeNull();
	});
});
