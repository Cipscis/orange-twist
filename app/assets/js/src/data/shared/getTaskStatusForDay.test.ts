import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	createTask,
	getTaskInfo,
	setTaskInfo,
} from '../tasks';
import {
	deleteDayTask,
	setDayTaskInfo,
} from '../dayTasks';

import { clear } from './clear';
import { TaskStatus } from 'types/TaskStatus';

import { getTaskStatusForDay } from './getTaskStatusForDay';

describe('getTaskStatusForDay', () => {
	afterEach(() => {
		clear();
	});

	test('returns null if the task does not exist', () => {
		expect(getTaskStatusForDay({
			taskId: 1,
			dayName: '2023-11-19',
		})).toBeNull();
	});

	test('returns the task\'s status if it has no days', () => {
		const taskId = createTask({ status: TaskStatus.IN_PROGRESS });
		// Delete the initial day task created automatically for the current day
		deleteDayTask({ taskId });

		const taskStatusForDay = getTaskStatusForDay({
			taskId,
			dayName: '2023-11-19',
		});

		expect(taskStatusForDay).toBe(TaskStatus.IN_PROGRESS);
	});

	test('returns null if the task did not exist yet on this day', () => {
		const taskId = createTask();
		// Delete the initial day task created automatically for the current day
		deleteDayTask({ taskId });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-19',
		}, {});

		expect(getTaskStatusForDay({
			taskId,
			dayName: '2023-11-18',
		})).toBe(null);
	});

	test('returns the status for the given day, if it has a day task', () => {
		const taskId = createTask();
		// Delete the initial day task created automatically for the current day
		deleteDayTask({ taskId });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-16',
		}, { status: TaskStatus.TODO });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-17',
		}, { status: TaskStatus.IN_PROGRESS });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-18',
		}, { status: TaskStatus.COMPLETED });

		expect(
			getTaskStatusForDay({ taskId, dayName: '2023-11-16' })
		).toBe(TaskStatus.TODO);
		expect(
			getTaskStatusForDay({ taskId, dayName: '2023-11-17' })
		).toBe(TaskStatus.IN_PROGRESS);
		expect(
			getTaskStatusForDay({ taskId, dayName: '2023-11-18' })
		).toBe(TaskStatus.COMPLETED);
	});

	test('returns the task\'s status if all its days are prior', () => {
		const taskId = createTask();
		// Delete the initial day task created automatically for the current day
		deleteDayTask({ taskId });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-16',
		}, { status: TaskStatus.TODO });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-17',
		}, { status: TaskStatus.IN_PROGRESS });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-18',
		}, { status: TaskStatus.COMPLETED });

		expect(getTaskInfo(taskId)?.status).toBe(TaskStatus.COMPLETED);
		expect(
			getTaskStatusForDay({ taskId, dayName: '2023-11-19' })
		).toBe(TaskStatus.COMPLETED);

		setTaskInfo(
			taskId,
			{ status: TaskStatus.APPROVED_TO_DEPLOY },
			{ forCurrentDay: false }
		);

		expect(getTaskInfo(taskId)?.status).toBe(TaskStatus.APPROVED_TO_DEPLOY);
		expect(
			getTaskStatusForDay({ taskId, dayName: '2023-11-19' })
		).toBe(TaskStatus.APPROVED_TO_DEPLOY);
	});

	test('returns the status of task\'s prior day if it has prior and future days', () => {
		const taskId = createTask();
		// Delete the initial day task created automatically for the current day
		deleteDayTask({ taskId });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-01',
		}, { status: TaskStatus.TODO });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-11',
		}, { status: TaskStatus.IN_PROGRESS });

		setDayTaskInfo({
			taskId,
			dayName: '2023-11-21',
		}, { status: TaskStatus.COMPLETED });

		expect(
			getTaskStatusForDay({ taskId, dayName: '2023-11-05' })
		).toBe(TaskStatus.TODO);
		expect(
			getTaskStatusForDay({ taskId, dayName: '2023-11-15' })
		).toBe(TaskStatus.IN_PROGRESS);
	});
});
