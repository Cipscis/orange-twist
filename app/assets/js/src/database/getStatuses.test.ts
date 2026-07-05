import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DatabaseData } from './types';
import type { ObjectStoreName } from './metadata';
import { createTestData } from './test-utils';

import { getStatuses } from './getStatuses';

describe('getStatuses', () => {
	beforeAll(async () => {
		await createTestData();
	});

	test('returns a Promise that resolves to statuses', async () => {
		const statuses = await getStatuses();

		expect(statuses).toEqual({
			1: {
				id: 1,
				alias: 'todo',
			},
			2: {
				id: 2,
				alias: 'in-progress',
			},
			3: {
				id: 3,
				alias: 'completed',
			},
		} satisfies DatabaseData[typeof ObjectStoreName.STATUS]);
	});
});
