import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTaskInfo } from '../types';
import { TaskStatus } from 'types/TaskStatus';

import { setDayTaskInfo } from '../setDayTaskInfo';
import { clear } from '../../shared';

import { saveDayTasks } from './saveDayTasks';

const firstDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-13',
	taskId: 1,

	status: TaskStatus.TODO,
	note: 'First note',
	summary: null,
};

const secondDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-13',
	taskId: 2,

	status: TaskStatus.TODO,
	note: 'Second note',
	summary: null,
};

describe('saveDayTasks', () => {
	beforeEach(() => {
		localStorage.clear();
		clear();
	});

	test('returns a Promise that resolves when the content of the day tasks register has been persisted', async () => {
		expect(localStorage.getItem('day-tasks')).toBeNull();

		setDayTaskInfo({ dayName: '2023-11-13', taskId: 1 }, firstDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-13', taskId: 2 }, secondDayTaskInfo);

		const saveDayTasksPromise = saveDayTasks();
		expect(saveDayTasksPromise).toBeInstanceOf(Promise);
		await expect(saveDayTasksPromise).resolves.toBeUndefined();

		expect(JSON.parse(localStorage.getItem('day-tasks')!)).toEqual([
			['2023-11-13_1', firstDayTaskInfo],
			['2023-11-13_2', secondDayTaskInfo],
		]);
	});
});
