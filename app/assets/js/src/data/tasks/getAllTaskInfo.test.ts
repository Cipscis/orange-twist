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

import { getAllTaskInfo } from './getAllTaskInfo';

const firstTaskInfo: TaskInfo = {
	id: 1,
	name: 'First task',
	status: TaskStatus.TODO,
	note: '',
};

const secondTaskInfo: TaskInfo = {
	id: 2,
	name: 'Second task',
	status: TaskStatus.IN_PROGRESS,
	note: 'Note',
};

describe('getAllTaskInfo', () => {
	beforeAll(() => {
		clear();
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
