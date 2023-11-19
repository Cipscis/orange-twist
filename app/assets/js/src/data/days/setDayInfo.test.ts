import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { tasksRegister } from 'data/tasks/tasksRegister';
import { createTask } from 'data/tasks';

import { dayTasksRegister } from 'data/dayTasks/dayTasksRegister';

import { TaskStatus } from 'types/TaskStatus';
import type { DayInfo } from './types';

import { daysRegister } from './daysRegister';
import { getDayInfo } from './getDayInfo';

import { setDayInfo } from './setDayInfo';
import { getDayTaskInfo, setDayTaskInfo } from 'data/dayTasks';

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

	test('when updating tasks, initialises the day task with the appropriate status', () => {
		const taskId = createTask();

		setDayTaskInfo({ taskId, dayName: '2023-11-17' }, { status: TaskStatus.IN_PROGRESS });
		setDayTaskInfo({ taskId, dayName: '2023-11-19' }, { status: TaskStatus.COMPLETED });

		setDayInfo('2023-11-18', { tasks: [taskId] });

		expect(getDayTaskInfo({ taskId, dayName: '2023-11-18' })?.status).toBe(TaskStatus.IN_PROGRESS);
	});
});
