import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ls } from 'persist';

import type { TaskInfo } from '../types';

import { TaskStatus } from 'types/TaskStatus';
import { setTaskInfo } from '../setTaskInfo';
import { clear } from '../../shared';

import { saveTasks } from './saveTasks';

const firstTaskInfo: TaskInfo = {
	id: 1,
	name: 'First task',
	status: TaskStatus.TODO,
	note: '',
	sortIndex: -1,
};

const secondTaskInfo: TaskInfo = {
	id: 2,
	name: 'Second task',
	status: TaskStatus.IN_PROGRESS,
	note: 'Note',
	sortIndex: -1,
};

describe('saveDays', () => {
	beforeEach(() => {
		localStorage.clear();
		clear();
	});

	test('returns a Promise that resolves when the content of the tasks register has been persisted', async () => {
		expect(localStorage.getItem('tasks')).toBeNull();

		setTaskInfo(1, firstTaskInfo);
		setTaskInfo(2, secondTaskInfo);

		const saveDaysPromise = saveTasks(ls);
		expect(saveDaysPromise).toBeInstanceOf(Promise);
		await expect(saveDaysPromise).resolves.toBeUndefined();

		expect(localStorage.getItem('tasks')).toEqual(JSON.stringify([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]));
	});
});
