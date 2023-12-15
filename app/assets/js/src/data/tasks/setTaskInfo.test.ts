import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getCurrentDateDayName } from 'util/index';

import type { TaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { getDayTaskInfo } from '../dayTasks';
import { getDayInfo } from '../days';
import { getTaskInfo } from './getTaskInfo';
import { clear } from '../shared';

import { setTaskInfo } from './setTaskInfo';

describe('setTaskInfo', () => {
	afterEach(() => {
		clear();
	});

	test('when passed a task ID without existing data, creates a new task with default information filling in the blanks', () => {
		expect(getTaskInfo(1)).toBeNull();

		setTaskInfo(
			1,
			{
				name: 'Task name',
				status: TaskStatus.IN_PROGRESS,
				note: 'Task note',
				sortIndex: -1,
				parent: null,
				children: [],
			} satisfies Omit<TaskInfo, 'id'> // <- Ensure we're testing every option
		);

		expect(getTaskInfo(1)).toEqual({
			id: 1,
			name: 'Task name',
			status: TaskStatus.IN_PROGRESS,
			note: 'Task note',
			sortIndex: -1,
			parent: null,
			children: [],
		});
	});

	test('when passed a task ID with existing data, updates that task with the passed data', () => {
		setTaskInfo(1, {
			name: 'Task name',
			status: TaskStatus.TODO,
			note: 'Task note',
			sortIndex: -1,
			parent: null,
			children: [],
		} satisfies Omit<TaskInfo, 'id'>);

		setTaskInfo(1, {
			name: 'Updated name',
		});

		expect(getTaskInfo(1)).toEqual({
			id: 1,
			name: 'Updated name',
			status: TaskStatus.TODO,
			note: 'Task note',
			sortIndex: -1,
			parent: null,
			children: [],
		});
	});

	test('defaults sortIndex based on task ID', () => {
		setTaskInfo(3, {});

		expect(getTaskInfo(3)?.sortIndex).toBe(-3);
	});

	describe('when setting the status for a task', () => {
		test('if the "forCurrentDay" option is absent or true, also updates the day task for the current day', () => {
			const currentDayName = getCurrentDateDayName();

			setTaskInfo(1, { status: TaskStatus.COMPLETED });
			expect(getDayTaskInfo({ dayName: currentDayName, taskId: 1 })).toEqual({
				dayName: currentDayName,
				taskId: 1,

				note: '',
				status: TaskStatus.COMPLETED,
			});
			expect(getDayInfo(currentDayName)?.tasks.includes(1)).toBe(true);

			setTaskInfo(2, { status: TaskStatus.COMPLETED }, { forCurrentDay: true });
			expect(getDayTaskInfo({ dayName: currentDayName, taskId: 2 })).toEqual({
				dayName: currentDayName,
				taskId: 2,

				note: '',
				status: TaskStatus.COMPLETED,
			});
			expect(getDayInfo(currentDayName)?.tasks.includes(2)).toBe(true);
		});

		test('if the "forCurrentDay" option is negated, doesn\'t update the day task for the current day', () => {
			const currentDayName = getCurrentDateDayName();

			setTaskInfo(1, { status: TaskStatus.COMPLETED }, { forCurrentDay: false });
			expect(getDayTaskInfo({ dayName: currentDayName, taskId: 1 })).toBeNull();
			expect(getDayInfo(currentDayName)?.tasks.includes(1)).toBeFalsy();
		});
	});
});
