import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getCurrentDateDayName } from 'util/index';

import type { TaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { dayTasksRegister } from 'registers/dayTasks/dayTasksRegister';
import { getDayTaskInfo } from 'registers/dayTasks';

import { tasksRegister } from './tasksRegister';
import { getTaskInfo } from './getTaskInfo';

import { setTaskInfo } from './setTaskInfo';

describe('setTaskInfo', () => {
	afterEach(() => {
		tasksRegister.clear();
		dayTasksRegister.clear();
	});

	test('when passed a task ID without existing data, creates a new task with default information filling in the blanks', () => {
		expect(getTaskInfo(1)).toBeNull();

		setTaskInfo(
			1,
			{
				name: 'Task name',
				status: TaskStatus.IN_PROGRESS,
			} satisfies Omit<TaskInfo, 'id'> // <- Ensure we're testing every option
		);

		expect(getTaskInfo(1)).toEqual({
			id: 1,
			name: 'Task name',
			status: TaskStatus.IN_PROGRESS,
		});
	});

	test('when passed a task ID with existing data, updates that task with the passed data', () => {
		setTaskInfo(1, {
			name: 'Task name',
			status: TaskStatus.TODO,
		} satisfies Omit<TaskInfo, 'id'>);

		setTaskInfo(1, {
			name: 'Updated name',
		});

		expect(getTaskInfo(1)).toEqual({
			id: 1,
			name: 'Updated name',
			status: TaskStatus.TODO,
		});
	});

	test('when setting the status for a task, also updates the day task for the current day', () => {
		const currentDayName = getCurrentDateDayName();

		setTaskInfo(1, { status: TaskStatus.COMPLETED });

		expect(getDayTaskInfo({ dayName: currentDayName, taskId: 1 })).toEqual({
			dayName: currentDayName,
			taskId: 1,

			note: '',
			status: TaskStatus.COMPLETED,
		});
	});
});
