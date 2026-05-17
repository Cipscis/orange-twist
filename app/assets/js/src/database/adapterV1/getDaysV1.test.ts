import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';

import { getDaysV1 } from './getDaysV1';

describe('getDaysV1', () => {
	beforeAll(async () => {
		await createTestData();
	});

	test('returns a Promise that resolves to day entries v1', async () => {
		const days = await getDaysV1();

		expect(days).toEqual([
			['2026-01-01', {
				name: '2026-01-01',
				note: 'Test note 2',
				tasks: [],
			}],
			['2026-04-26', {
				name: '2026-04-26',
				note: 'Test note 0',
				tasks: [1, 0],
			}],
			['2026-04-27', {
				name: '2026-04-27',
				note: 'Test note 1',
				tasks: [],
			}],
		]);
	});
});
