import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { tasksRegister } from 'registers/tasks/tasksRegister';
import { createTask } from 'registers/tasks';

import { dayTasksRegister } from 'registers/dayTasks/dayTasksRegister';

import type { DayInfo } from './types';

import { daysRegister } from './daysRegister';
import { getDayInfo } from './getDayInfo';

import { setDayInfo } from './setDayInfo';
import { getDayTaskInfo } from 'registers/dayTasks';

describe('setDayInfo', () => {
	afterEach(() => {
		// Delete all data
		daysRegister.clear();
		tasksRegister.clear();
		dayTasksRegister.clear();
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
				tasks: [1],
			} satisfies Omit<DayInfo, 'name'> // <- Ensure we're testing every option
		);

		expect(getDayInfo('2023-11-08')).toEqual({
			name: '2023-11-08',
			note: 'Test note',
			tasks: [1],
		});
	});

	test('when passed a day name with existing data, updates that day with the passed data', () => {
		setDayInfo('2023-11-18', {
			note: 'Test note',
			tasks: [1],
		} satisfies Omit<DayInfo, 'name'>);

		expect(getDayInfo('2023-11-18')).toEqual({
			name: '2023-11-18',
			note: 'Test note',
			tasks: [1],
		});

		setDayInfo('2023-11-18', { tasks: [1, 2] });

		expect(getDayInfo('2023-11-18')).toEqual({
			name: '2023-11-18',
			note: 'Test note',
			tasks: [1, 2],
		});
	});

	test('when updating tasks, ensures each one has a day task', () => {
		const taskId = createTask();

		setDayInfo('2023-11-19', { tasks: [taskId] });

		expect(getDayTaskInfo({ dayName: '2023-11-19', taskId })).not.toBeNull();
	});
});
