import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTaskIdentifier, DayTaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';

import { getDayInfo } from '../days';
import { getTaskInfo } from '../tasks';
import { getDayTaskInfo } from './getDayTaskInfo';
import { clear } from '../shared';

import { setDayTaskInfo } from './setDayTaskInfo';

describe('setDayTaskInfo', () => {
	afterEach(() => {
		clear();
	});

	test('when passed a day name and task ID without existing data, creates a new task and/or day as necessary with default information filling in the blanks', () => {
		expect(getDayTaskInfo({ dayName: '2023-11-12', taskId: 1 })).toBeNull();

		setDayTaskInfo(
			{
				dayName: '2023-11-12',
				taskId: 1,
			},
			{
				status: TaskStatus.IN_PROGRESS,
				note: 'Test note',
				summary: null,
			} satisfies Omit<DayTaskInfo, 'dayName' | 'taskId'> // <- Ensure we're testing every option
		);

		expect(getDayTaskInfo({ dayName: '2023-11-12', taskId: 1 })).toEqual({
			dayName: '2023-11-12',
			taskId: 1,
			status: TaskStatus.IN_PROGRESS,
			note: 'Test note',
			summary: null,
		});

		expect(getTaskInfo(1)).toEqual({
			id: 1,
			name: 'New task',
			status: TaskStatus.IN_PROGRESS,
			note: '',
			sortIndex: -1,
		});

		expect(getDayInfo('2023-11-12')).toEqual({
			name: '2023-11-12',
			note: '',
			tasks: [1],
		});

		setDayTaskInfo({ dayName: '2023-11-12', taskId: 2 }, { status: TaskStatus.COMPLETED });
		expect(getDayInfo('2023-11-12')?.tasks).toEqual([2, 1]);

		setDayTaskInfo({ dayName: '2023-11-12', taskId: 1 }, { status: TaskStatus.COMPLETED });
		expect(getDayInfo('2023-11-12')?.tasks).toEqual([2, 1]);
	});

	test('adds the task to the specified day, if it wasn\'t there already', () => {
		setDayTaskInfo({ dayName: '2023-11-18', taskId: 1 }, { status: TaskStatus.TODO });
		expect(getDayInfo('2023-11-18')?.tasks).toEqual([1]);

		setDayTaskInfo({ dayName: '2023-11-18', taskId: 2 }, { status: TaskStatus.TODO });
		expect(getDayInfo('2023-11-18')?.tasks).toEqual([2, 1]);

		setDayTaskInfo({ dayName: '2023-11-18', taskId: 2 }, { status: TaskStatus.COMPLETED });
		expect(getDayInfo('2023-11-18')?.tasks).toEqual([2, 1]);
	});

	test('doesn\'t allow the dayName or taskId properties to be overridden', () => {
		const testDayTaskInfo: DayTaskInfo = {
			dayName: '2000-01-01',
			taskId: -1,
			status: TaskStatus.TODO,
			note: 'Test note',
			summary: null,
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
			status: TaskStatus.TODO,
			note: 'Test note',
			summary: null,
		};

		setDayTaskInfo(testTaskInfo, testTaskInfo);
		expect(getDayTaskInfo(testTaskInfo)).toEqual(testTaskInfo);

		setDayTaskInfo(testTaskInfo, { status: TaskStatus.COMPLETED });
		expect(getDayTaskInfo(testTaskInfo)).toEqual({
			...testTaskInfo,
			status: TaskStatus.COMPLETED,
		});
	});

	describe('when updating status', () => {
		test('if there are no later days, updates the task\'s status to match', () => {
			setDayTaskInfo({ dayName: '2023-11-16', taskId: 1 }, { status: TaskStatus.TODO });
			expect(getTaskInfo(1)?.status).toEqual(TaskStatus.TODO);

			setDayTaskInfo({ dayName: '2023-11-18', taskId: 1 }, { status: TaskStatus.IN_PROGRESS });
			expect(getTaskInfo(1)?.status).toEqual(TaskStatus.IN_PROGRESS);

			setDayTaskInfo({ dayName: '2023-11-18', taskId: 1 }, { status: TaskStatus.COMPLETED });
			expect(getTaskInfo(1)?.status).toEqual(TaskStatus.COMPLETED);
		});

		test('if there is at least one later day, doesn\'t update the task\'s status', () => {
			setDayTaskInfo({ dayName: '2023-11-18', taskId: 1 }, { status: TaskStatus.COMPLETED });
			expect(getTaskInfo(1)?.status).toEqual(TaskStatus.COMPLETED);

			setDayTaskInfo({ dayName: '2023-11-17', taskId: 1 }, { status: TaskStatus.IN_PROGRESS });
			expect(getTaskInfo(1)?.status).toEqual(TaskStatus.COMPLETED);

			setDayTaskInfo({ dayName: '2023-11-16', taskId: 1 }, { status: TaskStatus.TODO });
			expect(getTaskInfo(1)?.status).toEqual(TaskStatus.COMPLETED);
		});
	});
});
