import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayInfo } from './types';

import { setDayInfo } from './setDayInfo';

import { getAllDayInfo } from './getAllDayInfo';

describe('getAllDayInfo', () => {
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

	test('returns an array of info on all days', () => {
		expect(getAllDayInfo()).toEqual([
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
});
