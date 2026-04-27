import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { sortElementsBySortIndex } from './sortElementsBySortIndex';

describe('sortElementsBySortIndex', () => {
	test('sorts elements by sortIndex', () => {
		expect(sortElementsBySortIndex(
			{ sortIndex: 3 },
			{ sortIndex: 2 },
		)).toBe(1);

		expect(sortElementsBySortIndex(
			{ sortIndex: 2 },
			{ sortIndex: 3 },
		)).toBe(-1);

		expect(sortElementsBySortIndex(
			{ sortIndex: 2 },
			{ sortIndex: 2 },
		)).toBe(0);
	});

	test('treats null as -Infinity', () => {
		expect(sortElementsBySortIndex(
			{ sortIndex: 3 },
			{ sortIndex: null },
		)).toBe(Infinity);

		expect(sortElementsBySortIndex(
			{ sortIndex: null },
			{ sortIndex: 3 },
		)).toBe(-Infinity);
	});

	test('treats two nulls as equal', () => {
		expect(sortElementsBySortIndex(
			{ sortIndex: null },
			{ sortIndex: null },
		)).toBe(0);
	});
});
