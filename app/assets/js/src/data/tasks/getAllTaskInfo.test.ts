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

import { getAllTaskInfo } from './getAllTaskInfo';

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

describe('getAllTaskInfo', () => {
	beforeAll(() => {
		tasksRegister.clear();
		setTaskInfo(1, firstTaskInfo);
		setTaskInfo(2, secondTaskInfo);
	});

	test('returns an array of info on all tasks', () => {
		expect(getAllTaskInfo()).toEqual([
			firstTaskInfo,
			secondTaskInfo,
		]);
	});
});
