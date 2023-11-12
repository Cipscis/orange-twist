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

describe('getDayTaskInfo', () => {
	beforeAll(() => {
		dayTasksRegister.clear();
		setDayTaskInfo('2023-11-12', 1, firstDayTaskInfo);
		setDayTaskInfo('2023-11-12', 2, secondDayTaskInfo);
	});

	test('when passed a day name task ID that has no info, returns null', () => {
		expect(getDayTaskInfo('2023-11-12', 3)).toBeNull();
		expect(getDayTaskInfo('2023-11-11', 1)).toBeNull();
	});

	test('when passed a day name and task ID that has info, returns that info', () => {
		expect(getDayTaskInfo('2023-11-12', 1)).toEqual(firstDayTaskInfo);
	});
});
