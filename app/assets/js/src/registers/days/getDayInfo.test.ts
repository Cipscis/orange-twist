import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { TaskStatus } from 'types/TaskStatus';
import type { DayInfo } from './types';

import { setDayInfo } from './setDayInfo';

import { getDayInfo } from './getDayInfo';

describe('getDayInfo', () => {
	beforeAll(() => {
		setDayInfo(
			'2023-11-07',
			{
				note: 'Test note',
				tasks: [1],
			} satisfies Omit<DayInfo, 'name'> // <- Ensure we're testing every option
		);
		setDayInfo(
			'2023-11-08',
			{
				note: 'Test note 2',
				tasks: [1],
			} satisfies Omit<DayInfo, 'name'> // <- Ensure we're testing every option
		);
	});

	test('when passed no arguments, returns an array of info on all days', () => {
		expect(getDayInfo()).toEqual([
			{
				name: '2023-11-07',
				note: 'Test note',
				tasks: [1],
			},
			{
				name: '2023-11-08',
				note: 'Test note 2',
				tasks: [1],
			},
		]);
	});

	test('when passed a day name that has no matching day, returns null', () => {
		expect(getDayInfo('Invalid day')).toBeNull();
	});

	test('when passed a day name that has a matching day, returns that day\'s info', () => {
		expect(getDayInfo('2023-11-07')).toEqual({
			name: '2023-11-07',
			note: 'Test note',
			tasks: [1],
		});
	});
});
