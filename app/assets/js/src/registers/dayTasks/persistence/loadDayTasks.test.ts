import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import type { DayTaskInfo } from '../types';
import { TaskStatus } from 'types/TaskStatus';

import { dayTasksRegister } from '../dayTasksRegister';
import { loadDayTasks } from './loadDayTasks';
import { setDayTaskInfo } from '../setDayTaskInfo';

const firstDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-13',
	taskId: 1,

	note: 'First note',
	status: TaskStatus.TODO,
};

const secondDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-13',
	taskId: 2,

	note: 'Second note',
	status: TaskStatus.IN_PROGRESS,
};

describe('loadDayTasks', () => {
	beforeEach(() => {
		localStorage.setItem('day-tasks', JSON.stringify([
			['2023-11-13_1', firstDayTaskInfo],
			['2023-11-13_2', secondDayTaskInfo],
		]));
		dayTasksRegister.clear();
	});

	test('returns a Promise that resolves when the day tasks register has been filled with the persisted days data', async () => {
		expect(Array.from(dayTasksRegister.entries())).toEqual([]);

		const loadDayTasksPromise = loadDayTasks();
		expect(loadDayTasksPromise).toBeInstanceOf(Promise);

		expect(Array.from(dayTasksRegister.entries())).toEqual([]);

		const loadDayTasksResult = await loadDayTasksPromise;
		expect(loadDayTasksResult).toBeUndefined();

		expect(Array.from(dayTasksRegister.entries())).toEqual([
			['2023-11-13_1', firstDayTaskInfo],
			['2023-11-13_2', secondDayTaskInfo],
		]);
	});

	test('returns a Promise that resolves if there is no data to load', async () => {
		localStorage.clear();

		expect(Array.from(dayTasksRegister.entries())).toEqual([]);

		const loadDayTasksPromise = loadDayTasks();
		expect(loadDayTasksPromise).toBeInstanceOf(Promise);

		expect(Array.from(dayTasksRegister.entries())).toEqual([]);

		const loadDayTasksResult = await loadDayTasksPromise;
		expect(loadDayTasksResult).toBeUndefined();

		expect(Array.from(dayTasksRegister.entries())).toEqual([]);
	});

	test('returns a Promise that rejects if invalid JSON has been persisted', () => {
		localStorage.setItem('day-tasks', 'invalid JSON');

		expect(loadDayTasks()).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if invalid data has been persisted', () => {
		localStorage.setItem('day-tasks', JSON.stringify(['Invalid data']));

		expect(loadDayTasks()).rejects.toBeInstanceOf(Error);
	});

	test('triggers up to a single "delete" event and a single "set" event', async () => {
		const spy = jest.fn();
		dayTasksRegister.addEventListener('delete', spy);
		dayTasksRegister.addEventListener('set', spy);

		await loadDayTasks();

		const entryObjArr = Array.from(
			dayTasksRegister.entries()
		).map(
			([key, value]) => ({ key, value })
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(entryObjArr);

		await loadDayTasks();

		expect(spy).toHaveBeenCalledTimes(3);
		expect(spy).toHaveBeenNthCalledWith(2, entryObjArr);
		expect(spy).toHaveBeenNthCalledWith(3, entryObjArr);
	});

	test('overwrites any existing data in the register', async () => {
		setDayTaskInfo('2023-11-12', 3, firstDayTaskInfo);
		setDayTaskInfo('2023-11-12', 4, secondDayTaskInfo);
		expect(Array.from(dayTasksRegister.entries())).toEqual([
			['2023-11-12_3', firstDayTaskInfo],
			['2023-11-12_4', secondDayTaskInfo],
		]);

		await loadDayTasks();

		expect(Array.from(dayTasksRegister.entries())).toEqual([
			['2023-11-13_1', firstDayTaskInfo],
			['2023-11-13_2', secondDayTaskInfo],
		]);
	});
});
