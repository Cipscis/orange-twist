import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { TaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { tasksRegister } from './tasksRegister';
import { getTaskInfo } from './getTaskInfo';
import { clear } from '../shared';
import { getCurrentDateDayName } from 'util/index';

import { createTask } from './createTask';
import { getDayInfo, setDayInfo } from 'data';

describe('createTask', () => {
	afterEach(() => {
		clear();
	});

	test('returns the ID of a newly created task', () => {
		expect(Array.from(tasksRegister.keys())).toEqual([]);

		const newId1 = createTask();
		expect(Array.from(tasksRegister.keys())).toEqual([newId1]);

		const newId2 = createTask();
		expect(newId2).not.toBe(newId1);
		expect(Array.from(tasksRegister.keys())).toEqual([newId1, newId2]);
	});

	test('can be called without any arguments, using all default values to create a new task', () => {
		const newId = createTask();

		const taskInfo = getTaskInfo(newId);
		expect(taskInfo).toEqual({
			id: newId,
			name: 'New task',
			status: TaskStatus.TODO,
		});
	});

	test('accepts a partial TaskInfo object, filling in any blanks with defaults', () => {
		const newIdPartial = createTask({
			name: 'Custom task name',
		});

		expect(getTaskInfo(newIdPartial)).toEqual({
			id: newIdPartial,
			name: 'Custom task name',
			status: TaskStatus.TODO,
		});

		const newIdFull = createTask({
			name: 'Custom task name',
			status: TaskStatus.IN_PROGRESS,
		} satisfies Omit<TaskInfo, 'id'>);

		expect(getTaskInfo(newIdFull)).toEqual({
			id: newIdFull,
			name: 'Custom task name',
			status: TaskStatus.IN_PROGRESS,
		});
	});

	test('doesn\'t add the task to the current day', () => {
		const currentDay = getCurrentDateDayName();
		setDayInfo(currentDay, {});

		const taskId = createTask();

		expect(getDayInfo(currentDay)?.tasks.includes(taskId)).toBe(false);
	});
});
