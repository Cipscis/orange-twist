import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { ls } from 'persist';

import type { TaskInfo } from '../types';

import { TaskStatus } from 'types/TaskStatus';
import { tasksRegister } from '../tasksRegister';
import { clear } from '../../shared';

import { loadTasksRegister } from './loadTasksRegister';

const firstTaskInfo: TaskInfo = {
	id: 1,
	name: 'First task',
	status: TaskStatus.TODO,
	note: '',
	sortIndex: -1,
};

const secondTaskInfo: TaskInfo = {
	id: 1,
	name: 'Second task',
	status: TaskStatus.IN_PROGRESS,
	note: 'Note',
	sortIndex: -1,
};

describe('loadTasksRegister', () => {
	beforeEach(() => {
		localStorage.setItem('tasks', JSON.stringify([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]));
		clear();
	});

	test('returns a Promise that resolves when the tasks register has been filled with the persisted tasks data', async () => {
		expect(Array.from(tasksRegister.entries())).toEqual([]);

		const loadTasksPromise = loadTasksRegister(ls);
		expect(loadTasksPromise).toBeInstanceOf(Promise);

		expect(Array.from(tasksRegister.entries())).toEqual([]);

		await expect(loadTasksPromise).resolves.toBeUndefined();

		expect(Array.from(tasksRegister.entries())).toEqual([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]);
	});

	test('returns a Promise that resolves if there is no data to load', async () => {
		localStorage.clear();

		expect(Array.from(tasksRegister.entries())).toEqual([]);

		const loadTasksPromise = loadTasksRegister(ls);
		expect(loadTasksPromise).toBeInstanceOf(Promise);

		expect(Array.from(tasksRegister.entries())).toEqual([]);

		await expect(loadTasksPromise).resolves.toBeUndefined();

		expect(Array.from(tasksRegister.entries())).toEqual([]);
	});

	test('returns a Promise that rejects if invalid JSON has been persisted', async () => {
		localStorage.setItem('tasks', 'invalid JSON');

		await expect(loadTasksRegister(ls)).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if invalid data has been persisted', async () => {
		localStorage.setItem('tasks', JSON.stringify(['Invalid data']));

		await expect(loadTasksRegister(ls)).rejects.toBeInstanceOf(Error);
	});

	test('triggers up to a single "delete" event and a single "set" event', async () => {
		const spy = jest.fn();
		tasksRegister.addEventListener('delete', spy);
		tasksRegister.addEventListener('set', spy);

		await loadTasksRegister(ls);

		const entryObjArr = Array.from(
			tasksRegister.entries()
		).map(
			([key, value]) => ({ key, value })
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(entryObjArr);

		await loadTasksRegister(ls);

		expect(spy).toHaveBeenCalledTimes(3);
		expect(spy).toHaveBeenNthCalledWith(2, entryObjArr);
		expect(spy).toHaveBeenNthCalledWith(3, entryObjArr);
	});

	test('overwrites any existing data in the register', async () => {
		const testData = [
			[3, { ...firstTaskInfo, id: 3 }],
			[4, { ...secondTaskInfo, id: 4 }],
		] as const;

		tasksRegister.set(testData);
		expect(Array.from(tasksRegister.entries())).toEqual(testData);

		await loadTasksRegister(ls);

		expect(Array.from(tasksRegister.entries())).toEqual([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]);
	});

	test('can be passed serialised data as an argument', async () => {
		await loadTasksRegister(ls, JSON.stringify([
			[1, {
				id: 1,
				name: 'Task name',
				status: TaskStatus.IN_PROGRESS,
				note: '',
				sortIndex: -1,
			}],
		]));
		expect(Array.from(tasksRegister.entries())).toEqual([
			[1, {
				id: 1,
				name: 'Task name',
				status: TaskStatus.IN_PROGRESS,
				note: '',
				sortIndex: -1,
			}],
		]);
	});
});
