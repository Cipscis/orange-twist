import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from 'database/test-utils';

import { getTasksV1 } from './getTasksV1';

describe('getTasksV1', () => {
	beforeAll(async () => {
		await createTestData();
	});

	test('returns a Promise that resolves to day entries v1', async () => {
		const tasks = await getTasksV1();

		expect(tasks).toEqual([
			[0, {
				id: 0,
				name: 'Test task 0',
				note: 'Test task 0 note',
				status: 'todo',
				sortIndex: 0,
			}],
			[1, {
				id: 1,
				name: 'Test task 1',
				note: 'Test task 1 note',
				status: 'in-progress',
				sortIndex: 1,
			}],
		]);
	});
});
