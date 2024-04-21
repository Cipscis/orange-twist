import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { ls } from 'persist';

import type { DayTaskInfo } from '../types';
import { TaskStatus } from 'types/TaskStatus';

import { dayTasksRegister } from '../dayTasksRegister';
import { setDayTaskInfo } from '../setDayTaskInfo';
import { clear } from '../../shared';

import { loadDayTasks } from './loadDayTasks';

const firstDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-13',
	taskId: 1,

	status: TaskStatus.TODO,
	note: 'First note',
	summary: null,
};

const secondDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-13',
	taskId: 2,

	status: TaskStatus.IN_PROGRESS,
	note: 'Second note',
	summary: null,
};

describe('loadDayTasks', () => {
	beforeEach(() => {
		localStorage.setItem('day-tasks', JSON.stringify([
			['2023-11-13_1', firstDayTaskInfo],
			['2023-11-13_2', secondDayTaskInfo],
		]));
		clear();
	});

	test('returns a Promise that resolves when the day tasks register has been filled with the persisted days data', async () => {
		expect(Array.from(dayTasksRegister.entries())).toEqual([]);

		const loadDayTasksPromise = loadDayTasks(ls);
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

		const loadDayTasksPromise = loadDayTasks(ls);
		expect(loadDayTasksPromise).toBeInstanceOf(Promise);

		expect(Array.from(dayTasksRegister.entries())).toEqual([]);

		const loadDayTasksResult = await loadDayTasksPromise;
		expect(loadDayTasksResult).toBeUndefined();

		expect(Array.from(dayTasksRegister.entries())).toEqual([]);
	});

	test('returns a Promise that rejects if invalid JSON has been persisted', async () => {
		localStorage.setItem('day-tasks', 'invalid JSON');

		await expect(loadDayTasks(ls)).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if invalid data has been persisted', async () => {
		localStorage.setItem('day-tasks', JSON.stringify(['Invalid data']));

		await expect(loadDayTasks(ls)).rejects.toBeInstanceOf(Error);
	});

	test('triggers up to a single "delete" event and a single "set" event', async () => {
		const spy = jest.fn();
		dayTasksRegister.addEventListener('delete', spy);
		dayTasksRegister.addEventListener('set', spy);

		await loadDayTasks(ls);

		const entryObjArr = Array.from(
			dayTasksRegister.entries()
		).map(
			([key, value]) => ({ key, value })
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(entryObjArr);

		await loadDayTasks(ls);

		expect(spy).toHaveBeenCalledTimes(3);
		expect(spy).toHaveBeenNthCalledWith(2, entryObjArr);
		expect(spy).toHaveBeenNthCalledWith(3, entryObjArr);
	});

	test('overwrites any existing data in the register', async () => {
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 3 }, firstDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 4 }, secondDayTaskInfo);
		expect(Array.from(dayTasksRegister.entries())).toEqual([
			['2023-11-12_3', {
				...firstDayTaskInfo,
				dayName: '2023-11-12',
				taskId: 3,
			}],
			['2023-11-12_4', {
				...secondDayTaskInfo,
				dayName: '2023-11-12',
				taskId: 4,
			}],
		]);

		await loadDayTasks(ls);

		expect(Array.from(dayTasksRegister.entries())).toEqual([
			['2023-11-13_1', firstDayTaskInfo],
			['2023-11-13_2', secondDayTaskInfo],
		]);
	});

	test('can be passed serialised data as an argument', async () => {
		await loadDayTasks(ls, JSON.stringify([
			['2023-12-10_1', {
				dayName: '2023-12-10',
				taskId: 1,
				status: TaskStatus.IN_PROGRESS,
				note: '',
				summary: null,
			}],
		]));
		expect(Array.from(dayTasksRegister.entries())).toEqual([
			['2023-12-10_1', {
				dayName: '2023-12-10',
				taskId: 1,
				status: TaskStatus.IN_PROGRESS,
				note: '',
				summary: null,
			}],
		]);
	});
});
