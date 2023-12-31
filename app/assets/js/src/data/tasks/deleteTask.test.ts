import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDayInfo, setDayInfo } from '../days';
import { getDayTaskInfo, setDayTaskInfo } from '../dayTasks';

import { setTaskInfo } from './setTaskInfo';
import { getTaskInfo } from './getTaskInfo';
import { createTask } from './createTask';
import { clear } from '../shared';

import { deleteTask } from './deleteTask';

describe('deleteTask', () => {
	afterEach(() => {
		clear();
	});

	test('when passed a task ID without any task data, does nothing', () => {
		expect(() => {
			deleteTask(-1);
		}).not.toThrow();
	});

	test('when passed a task ID that has task data, removes that task from the register', () => {
		setTaskInfo(1, {
			name: 'Test name',
		});
		expect(getTaskInfo(1)).not.toBeNull();

		deleteTask(1);
		expect(getTaskInfo(1)).toBeNull();
	});

	test('when passed a task ID with associated day tasks, removes them all from that register', () => {
		// Start by setting up data
		const taskId = createTask();

		setDayTaskInfo({ dayName: '2023-11-19', taskId }, { note: 'Test note' });

		expect(getDayTaskInfo({ dayName: '2023-11-19', taskId })).not.toBeNull();

		deleteTask(taskId);
		expect(getDayTaskInfo({ dayName: '2023-11-19', taskId })).toBeNull();
	});

	test('when passed a task ID that belongs to one or more days, removes the task from those days', () => {
		// Start by setting up data
		const taskId = createTask();

		setDayInfo('2023-11-18', { tasks: [taskId] });
		setDayInfo('2023-11-19', { tasks: [taskId] });

		deleteTask(taskId);

		expect(getDayInfo('2023-11-18')?.tasks).toEqual([]);
		expect(getDayInfo('2023-11-19')?.tasks).toEqual([]);
	});
});
