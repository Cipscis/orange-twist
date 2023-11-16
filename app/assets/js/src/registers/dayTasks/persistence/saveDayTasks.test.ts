import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTaskInfo } from '../types';
import { TaskStatus } from 'types/TaskStatus';

import { setDayTaskInfo } from '../setDayTaskInfo';
import { dayTasksRegister } from '../dayTasksRegister';

import { saveDayTasks } from './saveDayTasks';

const firstDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-13',
	taskId: 1,

	note: 'First note',
	status: TaskStatus.TODO,
};

const secondDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-13',
	taskId: 2,

	note: 'Second note',
	status: TaskStatus.TODO,
};

describe('saveDayTasks', () => {
	beforeEach(() => {
		localStorage.clear();
		dayTasksRegister.clear();
	});

	test('returns a Promise that resolves when the content of the day tasks register has been persisted', async () => {
		setDayTaskInfo({ dayName: '2023-11-13', taskId: 1 }, firstDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-13', taskId: 2 }, secondDayTaskInfo);

		expect(localStorage.getItem('day-tasks')).toBeNull();

		const saveDayTasksPromise = saveDayTasks();
		expect(saveDayTasksPromise).toBeInstanceOf(Promise);

		expect(localStorage.getItem('day-tasks')).toBeNull();

		const saveDayTasksResult = await saveDayTasksPromise;
		expect(saveDayTasksResult).toBeUndefined();

		expect(JSON.parse(localStorage.getItem('day-tasks')!)).toEqual([
			['2023-11-13_1', firstDayTaskInfo],
			['2023-11-13_2', secondDayTaskInfo],
		]);
	});
});
