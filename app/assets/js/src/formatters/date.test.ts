import {
	describe,
	expect,
	test,
} from '@jest/globals';
import { formatDate } from './date';

describe('formatDate', () => {
	test(`formats a date as 'YYYY-MM-DD'`, () => {
		const dates = [
			new Date(2023, 10, 11),
			new Date(2023, 5, 11),
			new Date(2023, 5, 1),
		];

		const dateStrings = dates.map(formatDate);

		expect(dateStrings).toEqual([
			'2023-11-11',
			'2023-06-11',
			'2023-06-01',
		]);
	});

	test('throws an error when receiving an invalid date', () => {
		const invalidDate = new Date('invalid date');

		expect(() => formatDate(invalidDate)).toThrow();
	});
});
