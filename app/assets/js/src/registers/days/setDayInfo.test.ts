import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { getDayInfo } from './getDayInfo';
import { deleteDayInfo } from './deleteDayInfo';

import { setDayInfo } from './setDayInfo';

describe('setDayInfo', () => {
	afterEach(() => {
		// Delete all days with data
		const dayNames = getDayInfo().map(({ name }) => name);
		for (const dayName of dayNames) {
			deleteDayInfo(dayName);
		}
	});

	test('when passed an invalid day name, throws an error', () => {
		expect(() => {
			setDayInfo('Invalid day name', {});
		}).toThrow();
	});

	test('when passed a day name without existing data, creates a new day with default information filling in the blanks', () => {
		expect(getDayInfo('2023-11-08')).toBeNull();

		setDayInfo(
			'2023-11-08',
			{
				note: 'Test note',
				tasks: [{
					id: 1,
					note: 'Note',
					status: TaskStatus.TODO,
				}],
			} satisfies Omit<DayInfo, 'name'> // <- Ensure we're testing every option
		);

		expect(getDayInfo('2023-11-08')).toEqual({
			name: '2023-11-08',
			note: 'Test note',
			tasks: [{
				id: 1,
				note: 'Note',
				status: TaskStatus.TODO,
			}],
		});
	});

	test.todo('when passed a day name with existing data, updates that day with the passed data');
});