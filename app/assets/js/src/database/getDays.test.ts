import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';
import { createTestData } from './test-utils';
import { getDays } from './getDays';

describe('getDays', () => {
	beforeAll(() => createTestData());

	test('returns all days', async () => {
		const days = await getDays();

		expect(days).toEqual([
			{
				id: 2,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 2',
			},
			{
				id: 0,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note 0',
			},
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 1',
			},
		]);
	});
});
