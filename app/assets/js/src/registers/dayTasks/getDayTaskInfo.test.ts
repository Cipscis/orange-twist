import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { dayTasksRegister } from './dayTasksRegister';
import { setDayTaskInfo } from './setDayTaskInfo';

import { getDayTaskInfo } from './getDayTaskInfo';

const firstDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 1,

	note: 'Test note',
	status: TaskStatus.IN_PROGRESS,
};

const secondDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 2,

	note: 'Test note 2',
	status: TaskStatus.COMPLETED,
};

const thirdDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 1,

	note: 'Test note 3',
	status: TaskStatus.COMPLETED,
};

const fourthDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 2,

	note: 'Test note 4',
	status: TaskStatus.COMPLETED,
};

describe('getDayTaskInfo', () => {
	beforeAll(() => {
		dayTasksRegister.clear();
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 1 }, firstDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 2 }, secondDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-16', taskId: 1 }, thirdDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-16', taskId: 2 }, fourthDayTaskInfo);
	});

	test('when passed a day name task ID that has no info, returns null', () => {
		expect(getDayTaskInfo({ dayName: '2023-11-12', taskId: 3 })).toBeNull();
		expect(getDayTaskInfo({ dayName: '2023-11-11', taskId: 1 })).toBeNull();
	});

	test('when passed a day name and task ID that has info, returns that info', () => {
		expect(getDayTaskInfo({ dayName: '2023-11-12', taskId: 1 })).toEqual(firstDayTaskInfo);
	});

	test('when passed a day name only, returns an array of all day tasks for that day', () => {
		expect(getDayTaskInfo({ dayName: '2023-11-12' })).toEqual([
			firstDayTaskInfo,
			secondDayTaskInfo,
		]);
	});

	test('when passed a task ID only, returns an array of all day tasks for that task', () => {
		expect(getDayTaskInfo({ taskId: 1 })).toEqual([
			firstDayTaskInfo,
			thirdDayTaskInfo,
		]);
	});

	test('when passed no arguments, returns an array of all day tasks', () => {
		expect(getDayTaskInfo()).toEqual([
			firstDayTaskInfo,
			secondDayTaskInfo,
			thirdDayTaskInfo,
			fourthDayTaskInfo,
		]);
	});
});
