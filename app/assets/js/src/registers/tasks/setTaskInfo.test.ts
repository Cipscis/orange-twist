import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { TaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { getTaskInfo } from './getTaskInfo';
import { deleteTask } from './deleteTask';

import { setTaskInfo } from './setTaskInfo';

describe('setTaskInfo', () => {
	afterEach(() => {
		// Delete all tasks with data
		const taskIds = getTaskInfo().map(({ id }) => id);
		for (const taskId of taskIds) {
			deleteTask(taskId);
		}
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
});
