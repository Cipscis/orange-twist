import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { Command } from 'types/Command';
import { addCommandListener, registerCommand } from 'registers/commands';

import { TaskStatus } from 'types/TaskStatus';
import {
	clear,
	setTaskInfo,
	type DayInfo,
	type DayTaskInfo,
	type TaskInfo,
	setDayTaskInfo,
	setDayInfo,
	getAllTaskInfo,
	getAllDayInfo,
	getAllDayTaskInfo,
	saveDays,
	saveTasks,
	saveDayTasks,
} from 'data';

import { loadExportData } from './loadExportData';

describe('loadExportData', () => {
	beforeAll(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	});

	beforeEach(() => {
		clear();
		localStorage.clear();
	});

	test('returns a Promise that resolves when correct export data is passed', async () => {
		const result = loadExportData({
			days: [],
			tasks: [],
			dayTasks: [],
		});

		await expect(result).resolves.toBeUndefined();
	});

	test('saves changes if import was successful', async () => {
		const controller = new AbortController();
		const { signal } = controller;

		const spy = jest.fn();
		addCommandListener(Command.DATA_SAVE, spy, { signal });

		const result = loadExportData({
			days: [],
			tasks: [],
			dayTasks: [],
		});

		expect(spy).not.toHaveBeenCalled();
		await result;
		expect(spy).toHaveBeenCalledTimes(1);

		controller.abort();
	});

	test('returns a Promise that rejects when incorrect export data is passed', async () => {
		const result = loadExportData({
			days: [[true, null]],
			tasks: [[true, null]],
			dayTasks: [[true, null]],
		});

		await expect(result).rejects.toBeInstanceOf(Error);
	});

	test('reverts to backed up data if any part of the import failed', async () => {
		const testTask: TaskInfo = {
			id: 1,
			name: 'Task name',
			note: 'Task note',
			status: TaskStatus.TODO,
			sortIndex: -1,
			parent: null,
			children: [],
		};
		const testDay: DayInfo = {
			name: '2023-12-11',
			note: 'Day note',
			tasks: [1],
		};
		const testDayTask: DayTaskInfo = {
			dayName: '2023-12-11',
			taskId: 1,
			note: 'Day task note',
			status: TaskStatus.TODO,
		};

		setTaskInfo(testTask.id, testTask, { forCurrentDay: false });
		setDayInfo(testDay.name, testDay);
		setDayTaskInfo(testDayTask, testDayTask);

		const result = loadExportData({
			days: [[true, null]],
			tasks: [[true, null]],
			dayTasks: [[true, null]],
		});

		await expect(result).rejects.toBeInstanceOf(Error);

		expect(getAllTaskInfo()).toEqual([testTask]);
		expect(getAllDayInfo()).toEqual([testDay]);
		expect(getAllDayTaskInfo()).toEqual([testDayTask]);
	});

	test('reverts to persisted data if reverting to backup failed', async () => {
		const testTask: TaskInfo = {
			id: 1,
			name: 'Task name',
			note: 'Task note',
			status: TaskStatus.TODO,
			sortIndex: -1,
			parent: null,
			children: [],
		};
		const testDay: DayInfo = {
			name: '2023-12-11',
			note: 'Day note',
			tasks: [1],
		};
		const testDayTask: DayTaskInfo = {
			dayName: '2023-12-11',
			taskId: 1,
			note: 'Day task note',
			status: TaskStatus.TODO,
		};

		setTaskInfo(testTask.id, testTask, { forCurrentDay: false });
		setDayInfo(testDay.name, testDay);
		setDayTaskInfo(testDayTask, testDayTask);

		saveTasks();
		saveDays();
		saveDayTasks();

		setTaskInfo(testTask.id, {
			// @ts-expect-error Testing invalid data
			id: 'Invalid id',
		}, { forCurrentDay: false });

		const result = loadExportData({
			days: [[true, null]],
			tasks: [[true, null]],
			dayTasks: [[true, null]],
		});

		await expect(result).rejects.toBeInstanceOf(Error);

		expect(getAllTaskInfo()).toEqual([testTask]);
		expect(getAllDayInfo()).toEqual([testDay]);
		expect(getAllDayTaskInfo()).toEqual([testDayTask]);
	});

	test('updates old export data', async () => {
		const testDay: DayInfo = {
			name: '2023-12-11',
			note: 'Day note',
			tasks: [1],
		};
		const testTask = {
			id: 1,
			name: 'Test task',
			status: TaskStatus.TODO,
		};
		const testDayTask: DayTaskInfo = {
			dayName: testDay.name,
			taskId: testTask.id,
			note: 'Day task note',
			status: TaskStatus.TODO,
		};

		const result = loadExportData({
			days: [[testDay.name, testDay]],
			tasks: [[testTask.id, testTask]],
			dayTasks: [[`${testDay.name}_${testTask.id}`, testDayTask]],
		});

		await expect(result).resolves.toBeUndefined();

		expect(getAllTaskInfo()).toEqual([{
			...testTask,
			note: '',
			sortIndex: -1,
			parent: null,
			children: [],
		}]);
		expect(getAllDayInfo()).toEqual([testDay]);
		expect(getAllDayTaskInfo()).toEqual([testDayTask]);
	});
});
