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

import { getDayTaskInfo } from './getDayTaskInfo';

const firstDayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 1,

	note: 'Test note',
	status: TaskStatus.IN_PROGRESS,
} as const satisfies DayTaskInfo;

const secondDayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 2,

	note: 'Test note 2',
	status: TaskStatus.COMPLETED,
} as const satisfies DayTaskInfo;

const thirdDayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 1,

	note: 'Test note 3',
	status: TaskStatus.COMPLETED,
} as const satisfies DayTaskInfo;

const fourthDayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 2,

	note: 'Test note 4',
	status: TaskStatus.COMPLETED,
} as const satisfies DayTaskInfo;

describe('getDayTaskInfo', () => {
	beforeAll(() => {
		clear();
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
});
