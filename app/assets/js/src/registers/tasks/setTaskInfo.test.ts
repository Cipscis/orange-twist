import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { TaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { getTaskInfo } from './getTaskInfo';
import { deleteTaskInfo } from './deleteTaskInfo';

import { setTaskInfo } from './setTaskInfo';

describe('setTaskInfo', () => {
	afterEach(() => {
		// Delete all tasks with data
		const taskIds = getTaskInfo().map(({ id }) => id);
		for (const taskId of taskIds) {
			deleteTaskInfo(taskId);
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

	test.todo('when passed a day name with existing data, updates that day with the passed data');
});
