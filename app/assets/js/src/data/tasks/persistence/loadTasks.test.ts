import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import type { TaskInfo } from '../types';

import { TaskStatus } from 'types/TaskStatus';
import { loadTasks } from './loadTasks';
import { tasksRegister } from '../tasksRegister';

const firstTaskInfo: TaskInfo = {
	id: 1,
	name: 'First task',
	status: TaskStatus.TODO,
};

const secondTaskInfo: TaskInfo = {
	id: 1,
	name: 'Second task',
	status: TaskStatus.IN_PROGRESS,
};

describe('loadTasks', () => {
	beforeEach(() => {
		localStorage.setItem('tasks', JSON.stringify([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]));
		tasksRegister.clear();
	});

	test('returns a Promise that resolves when the tasks register has been filled with the persisted tasks data', async () => {
		expect(Array.from(tasksRegister.entries())).toEqual([]);

		const loadTasksPromise = loadTasks();
		expect(loadTasksPromise).toBeInstanceOf(Promise);

		expect(Array.from(tasksRegister.entries())).toEqual([]);

		const loadTasksResult = await loadTasksPromise;
		expect(loadTasksResult).toBeUndefined();

		expect(Array.from(tasksRegister.entries())).toEqual([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]);
	});

	test('returns a Promise that resolves if there is no data to load', async () => {
		localStorage.clear();

		expect(Array.from(tasksRegister.entries())).toEqual([]);

		const loadTasksPromise = loadTasks();
		expect(loadTasksPromise).toBeInstanceOf(Promise);

		expect(Array.from(tasksRegister.entries())).toEqual([]);

		const loadTasksResult = await loadTasksPromise;
		expect(loadTasksResult).toBeUndefined();

		expect(Array.from(tasksRegister.entries())).toEqual([]);
	});

	test('returns a Promise that rejects if invalid JSON has been persisted', () => {
		localStorage.setItem('tasks', 'invalid JSON');

		expect(loadTasks()).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if invalid data has been persisted', () => {
		localStorage.setItem('tasks', JSON.stringify(['Invalid data']));

		expect(loadTasks()).rejects.toBeInstanceOf(Error);
	});

	test('triggers up to a single "delete" event and a single "set" event', async () => {
		const spy = jest.fn();
		tasksRegister.addEventListener('delete', spy);
		tasksRegister.addEventListener('set', spy);

		await loadTasks();

		const entryObjArr = Array.from(
			tasksRegister.entries()
		).map(
			([key, value]) => ({ key, value })
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(entryObjArr);

		await loadTasks();

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

		await loadTasks();

		expect(Array.from(tasksRegister.entries())).toEqual([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]);
	});
});
