import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from 'database/test-utils';

import { getStatuses } from './getStatuses';

describe('getStatuses', () => {
	beforeAll(async () => {
		await createTestData();
	});

	test('returns a Promise that resolves to statuses', async () => {
		const statuses = await getStatuses();

		expect(statuses).toEqual({
			0: {
				id: 0,
				name: 'todo',
				isComplete: false,
			},
			1: {
				id: 1,
				name: 'in-progress',
				isComplete: false,
			},
			2: {
				id: 2,
				name: 'complete',
				isComplete: true,
			},
		});
	});
});
