import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTaskInfo } from './types';
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
		expect(getDayTaskInfo('2023-11-12', 1)).toBeNull();

		setDayTaskInfo(
			'2023-11-12',
			1,
			{
				note: 'Test note',
				status: TaskStatus.IN_PROGRESS,
			} satisfies Omit<DayTaskInfo, 'dayName' | 'taskId'> // <- Ensure we're testing every option
		);

		expect(getDayTaskInfo('2023-11-12', 1)).toEqual({
			dayName: '2023-11-12',
			taskId: 1,
			note: 'Test note',
			status: TaskStatus.IN_PROGRESS,
		});
	});

	test.todo('when passed a day name and task ID with existing data, updates that day task with the passed data');
});
