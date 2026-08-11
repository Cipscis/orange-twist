import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';

import { getTasksV1 } from './getTasksV1';

describe('getTasksV1', () => {
	beforeAll(() => createTestData());

	test('returns a Promise that resolves to task entries v1', async () => {
		const tasks = await getTasksV1();

		expect(tasks).toEqual([
			[3, {
				id: 3,
				name: 'Test task 3',
				note: 'Test task 3 note',
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
			[2, {
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				status: 'in-progress',
				sortIndex: 2,
			}],
		] satisfies Awaited<ReturnType<typeof getTasksV1>>);
	});
});
