import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { sortDaysChronologically } from './sortDaysChronologically';

describe('sortDaysChronologically', () => {
	test('sorts two days chronologically (in ascending order)', () => {
		const dayA = {
			year: 2026,
			month: 8,
			day: 11,
		};
		const dayB = {
			year: 2026,
			month: 8,
			day: 12,
		};
		const dayC = {
			year: 2026,
			month: 9,
			day: 10,
		};
		const dayD = {
			year: 2027,
			month: 1,
			day: 12,
		};

		expect(
			sortDaysChronologically(dayA, dayA)
		).toBe(0);


		expect(
			sortDaysChronologically(dayA, dayB)
		).toBe(-1);


		expect(
			sortDaysChronologically(dayA, dayC)
		).toBe(-1);


		expect(
			sortDaysChronologically(dayA, dayD)
		).toBe(-1);

		expect([dayD, dayB, dayA, dayC].toSorted(sortDaysChronologically)).toEqual([dayA, dayB, dayC, dayD]);
	});
});
