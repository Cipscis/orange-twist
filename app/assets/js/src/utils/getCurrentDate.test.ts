import {
	afterAll,
	beforeAll,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { getCurrentDate } from './getCurrentDate';

describe('getCurrentDate', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('returns the current date during the day', () => {
		jest.setSystemTime(new Date(2023, 9, 28, 12));

		expect(getCurrentDate()).toEqual({
			year: 2023,
			month: 10,
			day: 28,
		});
	});

	test('returns the previous date between midnight and 3am', () => {
		jest.setSystemTime(new Date(2023, 9, 29));

		expect(getCurrentDate()).toEqual({
			year: 2023,
			month: 10,
			day: 28,
		});

		jest.setSystemTime(new Date(2023, 9, 29, 2, 59, 59));

		expect(getCurrentDate()).toEqual({
			year: 2023,
			month: 10,
			day: 28,
		});

		jest.setSystemTime(new Date(2023, 9, 29, 3));

		expect(getCurrentDate()).toEqual({
			year: 2023,
			month: 10,
			day: 29,
		});
	});
});
