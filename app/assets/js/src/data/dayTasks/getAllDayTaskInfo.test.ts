import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { setDayTaskInfo } from './setDayTaskInfo';
import { clear } from '../shared';

import { getAllDayTaskInfo } from './getAllDayTaskInfo';

const firstDayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 1,

	status: TaskStatus.IN_PROGRESS,
	note: 'Test note',
	summary: null,
} as const satisfies DayTaskInfo;

const secondDayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 2,

	status: TaskStatus.COMPLETED,
	note: 'Test note 2',
	summary: null,
} as const satisfies DayTaskInfo;

const thirdDayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 1,

	status: TaskStatus.COMPLETED,
	note: 'Test note 3',
	summary: null,
} as const satisfies DayTaskInfo;

const fourthDayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 2,

	status: TaskStatus.COMPLETED,
	note: 'Test note 4',
	summary: null,
} as const satisfies DayTaskInfo;

describe('getAllDayTaskInfo', () => {
	beforeAll(() => {
		clear();
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 1 }, firstDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 2 }, secondDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-16', taskId: 1 }, thirdDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-16', taskId: 2 }, fourthDayTaskInfo);
	});

	test('when passed a day name and task ID that has no info, returns an empty array', () => {
		expect(getAllDayTaskInfo({ dayName: '2023-11-12', taskId: 3 })).toEqual([]);
		expect(getAllDayTaskInfo({ dayName: '2023-11-11', taskId: 1 })).toEqual([]);
	});

	test('when passed a day name and task ID that has info, returns an array with one element containing that info', () => {
		expect(getAllDayTaskInfo({ dayName: '2023-11-12', taskId: 1 })).toEqual([firstDayTaskInfo]);
	});

	test('when passed a day name only, returns an array of all day tasks for that day', () => {
		expect(getAllDayTaskInfo({ dayName: '2023-11-12' })).toEqual([
			firstDayTaskInfo,
			secondDayTaskInfo,
		]);
	});

	test('when passed a task ID only, returns an array of all day tasks for that task', () => {
		expect(getAllDayTaskInfo({ taskId: 1 })).toEqual([
			firstDayTaskInfo,
			thirdDayTaskInfo,
		]);
	});

	test('when passed no arguments, returns an array of all day tasks', () => {
		expect(getAllDayTaskInfo()).toEqual([
			firstDayTaskInfo,
			secondDayTaskInfo,
			thirdDayTaskInfo,
			fourthDayTaskInfo,
		]);
	});

	test('when passed a blank identifier, returns an array of all day tasks', () => {
		expect(getAllDayTaskInfo({})).toEqual([
			firstDayTaskInfo,
			secondDayTaskInfo,
			thirdDayTaskInfo,
			fourthDayTaskInfo,
		]);
	});
});
