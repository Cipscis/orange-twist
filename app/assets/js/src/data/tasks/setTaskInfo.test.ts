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

	test('when setting the parent, updates any old and new parents\' children', () => {
		setTaskInfo(1, { name: 'First parent' });
		setTaskInfo(2, { name: 'Second parent' });
		expect(getTaskInfo(1)?.children).toEqual([]);
		expect(getTaskInfo(2)?.children).toEqual([]);

		setTaskInfo(3, { name: 'Child task', parent: 1 });
		expect(getTaskInfo(1)?.children).toEqual([3]);
		expect(getTaskInfo(2)?.children).toEqual([]);

		setTaskInfo(3, { name: 'Child task', parent: 2 });
		expect(getTaskInfo(1)?.children).toEqual([]);
		expect(getTaskInfo(2)?.children).toEqual([3]);

		setTaskInfo(3, { name: 'Child task', parent: null });
		expect(getTaskInfo(1)?.children).toEqual([]);
		expect(getTaskInfo(2)?.children).toEqual([]);
	});

	test('when setting the children, updates any old and new children\'s parents', () => {
		setTaskInfo(1, { name: 'First child' });
		setTaskInfo(2, { name: 'Second child' });
		expect(getTaskInfo(1)?.parent).toBeNull();
		expect(getTaskInfo(2)?.parent).toBeNull();

		setTaskInfo(3, { name: 'Parent task', children: [1] });
		expect(getTaskInfo(1)?.parent).toBe(3);
		expect(getTaskInfo(2)?.parent).toBeNull();

		setTaskInfo(3, { name: 'Parent task', children: [2, 1] });
		expect(getTaskInfo(1)?.parent).toBe(3);
		expect(getTaskInfo(2)?.parent).toBe(3);

		setTaskInfo(3, { name: 'Parent task', children: [] });
		expect(getTaskInfo(1)?.parent).toBeNull();
		expect(getTaskInfo(2)?.parent).toBeNull();
	});
});
