import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { tasksRegister } from './tasksRegister';

import { setAllTaskInfo } from './setAllTaskInfo';
import {
	clear,
	getAllTaskInfo,
	getTaskInfo,
	setTaskInfo,
} from 'data';
import { TaskStatus } from 'types/TaskStatus';

describe('setAllTaskInfo', () => {
	beforeEach(() => {
		clear();
	});

	test('sets info for multiple tasks', () => {
		setAllTaskInfo([
			[1, { name: 'Task one' }],
			[2, { name: 'Task two' }],
		]);

		expect(getAllTaskInfo()).toEqual([
			{
				id: 1,
				name: 'Task one',
				note: '',
				status: TaskStatus.TODO,
				sortIndex: -1,
			},
			{
				id: 2,
				name: 'Task two',
				note: '',
				status: TaskStatus.TODO,
				sortIndex: -2,
			},
		]);
	});

	test('when not overriding values, persists previous values', () => {
		setTaskInfo(1, {
			name: 'Task name',
			note: 'Task note',
			status: TaskStatus.IN_PROGRESS,
			sortIndex: 1,
		});

		setAllTaskInfo([[1, {}]]);

		expect(getTaskInfo(1)).toEqual({
			id: 1,
			name: 'Task name',
			note: 'Task note',
			status: TaskStatus.IN_PROGRESS,
			sortIndex: 1,
		});
	});

	test('when creating a new task, fills in any blanks with default values', () => {
		setAllTaskInfo([[2, {}]]);

		expect(getTaskInfo(2)).toEqual({
			id: 2,
			name: 'New task',
			note: '',
			status: TaskStatus.TODO,
			sortIndex: -2,
		});
	});

	test('causes a single "set" event to be emitted on the tasks register', () => {
		const controller = new AbortController();
		const { signal } = controller;

		const spy = jest.fn();

		tasksRegister.addEventListener('set', spy, { signal });

		setAllTaskInfo([[1, {}], [2, {}]]);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith([
			{
				key: 1,
				value: {
					id: 1,
					name: 'New task',
					note: '',
					status: TaskStatus.TODO,
					sortIndex: -1,
				},
			},
			{
				key: 2,
				value: {
					id: 2,
					name: 'New task',
					note: '',
					status: TaskStatus.TODO,
					sortIndex: -2,
				},
			},
		]);

		controller.abort();
	});
});
