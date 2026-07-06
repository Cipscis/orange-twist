import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';

import { getDayTasksV1 } from './getDayTasksV1';

describe('getDayTasksV1', () => {
	beforeAll(() => createTestData());

	test('returns a Promise that resolves to day task entries v1', async () => {
		const dayTasks = await getDayTasksV1();

		expect(dayTasks).toEqual([
			['2026-04-26_2', {
				dayName: '2026-04-26',
				taskId: 2,
				note: 'Note for task 2 day 1',
				summary: 'Summary for task 2 day 1',
				status: 'in-progress',
			}],
			['2026-04-26_1', {
				dayName: '2026-04-26',
				taskId: 1,
				note: 'Note for task 1 day 1',
				summary: 'Summary for task 1 day 1',
				status: 'in-progress',
			}],
		] satisfies Awaited<ReturnType<typeof getDayTasksV1>>);
	});
});
