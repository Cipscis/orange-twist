import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from './test-utils';

import { getDay } from './getDay';

describe('getDay', () => {
	beforeAll(async () => {
		await createTestData();
	});

	test('returns a day based on the specified ID', async () => {
		const day = await getDay(1);

		expect(day).toEqual({
			id: 1,
			year: 2026,
			month: 4,
			day: 26,
			note: 'Test note 1',
		});
	});

	test('returns null if the day doesn\'t exist', async () => {
		const day = await getDay(-1);

		expect(day).toBeNull();
	});
});
