import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { daysRegister } from './daysRegister';
import { tasksRegister } from 'data/tasks/tasksRegister';
import { dayTasksRegister } from 'data/dayTasks/dayTasksRegister';

import { setDayInfo } from './setDayInfo';
import { getDayInfo } from './getDayInfo';

import { deleteDay } from './deleteDay';
import { createTask } from 'data/tasks';
import { getDayTaskInfo, setDayTaskInfo } from 'data/dayTasks';

describe('deleteDay', () => {
	afterEach(() => {
		// Clear all registers
		daysRegister.clear();
		tasksRegister.clear();
		dayTasksRegister.clear();
	});

	test('when passed a day name without any day data, does nothing', () => {
		expect(() => {
			deleteDay('2023-11-08');
		}).not.toThrow();
	});

	test('when passed a day name that has day data, removes that day from the register', () => {
		setDayInfo('2023-11-08', {
			note: 'Test note',
		});
		expect(getDayInfo('2023-11-08')).not.toBeNull();

		deleteDay('2023-11-08');
		expect(getDayInfo('2023-11-08')).toBeNull();
	});

	test('when passed a day name with associated day tasks, removes them all from that register', () => {
		// Start by setting up data
		const taskId = createTask();

		setDayInfo('2023-11-19', { tasks: [taskId] });
		setDayTaskInfo({ dayName: '2023-11-19', taskId }, { note: 'Test note' });

		expect(getDayTaskInfo({ dayName: '2023-11-19', taskId })).not.toBeNull();

		deleteDay('2023-11-19');
		expect(getDayTaskInfo({ dayName: '2023-11-19', taskId })).toBeNull();
	});
});
