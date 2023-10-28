import {
	afterAll,
	beforeAll,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import { getCurrentDateDayName } from './getCurrentDateDayName.js';

describe('getCurrentDateDayName', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('returns the current date during the day', () => {
		jest.setSystemTime(new Date(2023, 9, 28, 12));

		expect(getCurrentDateDayName()).toEqual('2023-10-28');
	});

	test('returns the previous date between midnight and 3am', () => {
		jest.setSystemTime(new Date(2023, 9, 29));

		expect(getCurrentDateDayName()).toEqual('2023-10-28');

		jest.setSystemTime(new Date(2023, 9, 29, 2, 59, 59));

		expect(getCurrentDateDayName()).toEqual('2023-10-28');

		jest.setSystemTime(new Date(2023, 9, 29, 3));

		expect(getCurrentDateDayName()).toEqual('2023-10-29');
	});
});
