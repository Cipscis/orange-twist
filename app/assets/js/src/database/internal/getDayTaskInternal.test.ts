import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getDayTaskInternal } from './getDayTaskInternal';

describe('getDayTaskInternal', () => {
	beforeAll(() => createTestData());

	test('receives a day task by its ID', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK);

		const dayTask = await getDayTaskInternal(transaction, 2);

		expect(dayTask).toEqual({
			id: 2,
			day: 1,
			task: 2,
			note: 'Note for task 2 day 1',
			summary: 'Summary for task 2 day 1',
			status: 2,
			sortIndex: 0,
		} satisfies Awaited<ReturnType<typeof getDayTaskInternal>>);
	});

	test('returns null if no such day task exists', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK);

		const dayTask = await getDayTaskInternal(transaction, -1);

		expect(dayTask).toBeNull();
	});
});
