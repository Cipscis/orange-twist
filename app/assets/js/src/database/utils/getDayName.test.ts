import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDayName } from './getDayName';

describe('getDayName', () => {
	test('converts a day to the correct string representation', () => {
		expect(
			getDayName({
				year: 2026,
				month: 7,
				day: 6,
			})
		).toBe('2026-07-06');

		expect(
			getDayName({
				year: 2026,
				month: 11,
				day: 16,
			})
		).toBe('2026-11-16');
	});
});
