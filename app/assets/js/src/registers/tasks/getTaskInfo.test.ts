import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { TaskStatus } from 'types/TaskStatus';
import type { TaskInfo } from './types';

import { tasksRegister } from './tasksRegister';
import { setTaskInfo } from './setTaskInfo';

import { getTaskInfo } from './getTaskInfo';

const firstTaskInfo: TaskInfo = {
	id: 1,
	name: 'First task',
	status: TaskStatus.TODO,
};

const secondTaskInfo: TaskInfo = {
	id: 2,
	name: 'Second task',
	status: TaskStatus.IN_PROGRESS,
};

describe('getTaskInfo', () => {
	beforeAll(() => {
		tasksRegister.clear();
		setTaskInfo(1, firstTaskInfo);
		setTaskInfo(2, secondTaskInfo);
	});

	test('when passed no arguments, returns an array of info on all tasks', () => {
		expect(getTaskInfo()).toEqual([
			firstTaskInfo,
			secondTaskInfo,
		]);
	});

	test('when passed a task ID that has no matching task, returns null', () => {
		expect(getTaskInfo(-1)).toBeNull();
	});

	test('when passed a task ID that has a matching task, returns that task\'s info', () => {
		expect(getTaskInfo(1)).toEqual(firstTaskInfo);
	});

	test('when passed an array of task IDs, returns an array of those tasks\' info', () => {
		expect(getTaskInfo([1, 3, 2])).toEqual([firstTaskInfo, null, secondTaskInfo]);
	});
});
