import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { formatDayName } from './dayName';

describe('formatDayName', () => {
	test.each([
		[{ year: 2023, month: 11, day: 11 }, '2023-11-11'],
		[{ year: 2023, month: 6, day: 11 }, '2023-06-11'],
		[{ year: 2023, month: 6, day: 1 }, '2023-06-01'],
	])(`formats a date as 'YYYY-MM-DD'`, (day, dayName) => {
		expect(formatDayName(day)).toEqual(dayName);
	});
});
