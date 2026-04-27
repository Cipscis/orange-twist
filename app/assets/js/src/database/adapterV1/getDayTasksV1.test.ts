import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from 'database/test-utils';

import { getDayTasksV1 } from './getDayTasksV1';

describe('getDayTasksV1', () => {
	beforeAll(async () => {
		await createTestData();
	});

	test('returns a Promise that resolves to day task entries v1', async () => {
		const dayTasks = await getDayTasksV1();

		expect(dayTasks).toEqual([
			['2026-04-26_1', {
				dayName: '2026-04-26',
				taskId: 1,
				note: 'Note for task 1 day 0',
				summary: 'Summary for task 1 day 0',
				status: 'in-progress',
			}],
			['2026-04-26_0', {
				dayName: '2026-04-26',
				taskId: 0,
				note: 'Note for task 0 day 0',
				summary: 'Summary for task 0 day 0',
				status: 'in-progress',
			}],
		]);
	});
});
