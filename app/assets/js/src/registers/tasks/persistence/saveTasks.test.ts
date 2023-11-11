import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { TaskInfo } from '../types';

import { TaskStatus } from 'types/TaskStatus';
import { setTaskInfo } from '../setTaskInfo';
import { saveTasks } from './saveTasks';
import { tasksRegister } from '../tasksRegister';

const firstTaskInfo: TaskInfo = {
	id: 1,
	name: 'First task',
	status: TaskStatus.TODO,
};

const secondTaskInfo: TaskInfo = {
	id: 1,
	name: 'Second task',
	status: TaskStatus.IN_PROGRESS,
};

describe('saveDays', () => {
	beforeEach(() => {
		localStorage.clear();
		tasksRegister.clear();
	});

	test('returns a Promise that resolves when the content of the tasks register has been persisted', async () => {
		setTaskInfo(1, firstTaskInfo);
		setTaskInfo(2, secondTaskInfo);

		expect(localStorage.getItem('tasks')).toBeNull();

		const saveDaysPromise = saveTasks();
		expect(saveDaysPromise).toBeInstanceOf(Promise);

		expect(localStorage.getItem('tasks')).toBeNull();

		const saveDaysResult = await saveDaysPromise;
		expect(saveDaysResult).toBeUndefined();

		expect(localStorage.getItem('tasks')).toEqual(JSON.stringify([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]));
	});
});
