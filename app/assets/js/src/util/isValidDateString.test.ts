import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { isValidDateString } from './isValidDateString.js';

describe('isValidDateString', () => {
	test('returns true if passed a valid date string', () => {
		expect(isValidDateString('2023-10-28')).toEqual(true);
	});

	test('returns false if passed an invalid date string', () => {
		expect(isValidDateString('20231008')).toEqual(false);
	});

	test('returns false if passed a validly formatted string of an invalid date', () => {
		expect(isValidDateString('2023-10-32')).toBe(false);
	});
});
