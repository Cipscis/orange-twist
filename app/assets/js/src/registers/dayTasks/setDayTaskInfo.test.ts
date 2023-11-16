import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTaskIdentifier, DayTaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { dayTasksRegister } from './dayTasksRegister';
import { getDayTaskInfo } from './getDayTaskInfo';

import { setDayTaskInfo } from './setDayTaskInfo';

describe('setDayTaskInfo', () => {
	afterEach(() => {
		// Delete all tasks with data
		dayTasksRegister.clear();
	});

	test('when passed a day name and task ID without existing data, creates a new task with default information filling in the blanks', () => {
		expect(getDayTaskInfo({ dayName: '2023-11-12', taskId: 1 })).toBeNull();

		setDayTaskInfo(
			{
				dayName: '2023-11-12',
				taskId: 1,
			},
			{
				note: 'Test note',
				status: TaskStatus.IN_PROGRESS,
			} satisfies Omit<DayTaskInfo, 'dayName' | 'taskId'> // <- Ensure we're testing every option
		);

		expect(getDayTaskInfo({ dayName: '2023-11-12', taskId: 1 })).toEqual({
			dayName: '2023-11-12',
			taskId: 1,
			note: 'Test note',
			status: TaskStatus.IN_PROGRESS,
		});
	});

	test('doesn\'t allow the dayName or taskId properties to be overridden', () => {
		const testDayTaskInfo: DayTaskInfo = {
			dayName: '2000-01-01',
			taskId: -1,
			note: 'Test note',
			status: TaskStatus.TODO,
		};
		const testDayTaskIdentifier: DayTaskIdentifier = { dayName: '2023-11-16', taskId: 3 };

		setDayTaskInfo(testDayTaskIdentifier, testDayTaskInfo);

		expect(getDayTaskInfo(testDayTaskIdentifier)).toEqual({
			...testDayTaskInfo,
			...testDayTaskIdentifier,
		});
	});

	test('when passed a day name and task ID with existing data, updates that day task with the passed data', () => {
		const testTaskInfo: DayTaskInfo = {
			dayName: '2023-11-16',
			taskId: 1,
			note: 'Test note',
			status: TaskStatus.TODO,
		};

		setDayTaskInfo(testTaskInfo, testTaskInfo);
		expect(getDayTaskInfo(testTaskInfo)).toEqual(testTaskInfo);

		setDayTaskInfo(testTaskInfo, { status: TaskStatus.COMPLETED });
		expect(getDayTaskInfo(testTaskInfo)).toEqual({
			...testTaskInfo,
			status: TaskStatus.COMPLETED,
		});
	});
});
