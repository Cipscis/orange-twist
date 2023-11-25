import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { TaskStatus } from 'types/TaskStatus';
import type { TaskInfo } from './types';

import { setTaskInfo } from './setTaskInfo';
import { clear } from '../shared';

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
		clear();
		setTaskInfo(1, firstTaskInfo);
		setTaskInfo(2, secondTaskInfo);
	});

	test('when passed a task ID that has no matching task, returns null', () => {
		expect(getTaskInfo(-1)).toBeNull();
	});

	test('when passed a task ID that has a matching task, returns that task\'s info', () => {
		expect(getTaskInfo(1)).toEqual(firstTaskInfo);
	});
});
