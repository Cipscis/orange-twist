import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { renderHook } from '@testing-library/preact';

import type { TaskInfo } from '../types';

import { tasksRegister } from '../tasksRegister';
import { TaskStatus } from 'types/TaskStatus';

import { useTaskInfo } from './useTaskInfo';

const firstTaskInfo: TaskInfo = {
	id: 1,
	name: 'First task',
	status: TaskStatus.TODO,
};

const secondTaskInfo: TaskInfo = {
	id: 2,
	name: 'Second task',
	status: TaskStatus.IN_PROGRESS,
};

describe('useTaskInfo', () => {
	beforeEach(() => {
		tasksRegister.set([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
		]);
	});

	afterEach(() => {
		tasksRegister.clear();
	});

	test('when passed no arguments, if there are no tasks, returns an empty array', () => {
		tasksRegister.clear();

		const { result } = renderHook(() => useTaskInfo());
		expect(result.current).toEqual([]);
	});

	test('when passed no arguments, returns an array of info on all tasks', () => {
		const { result } = renderHook(() => useTaskInfo());

		expect(result.current).toEqual([firstTaskInfo, secondTaskInfo]);
	});

	test('when passed a task ID that has no matching task, returns null', () => {
		const { result } = renderHook(() => useTaskInfo(-1));

		expect(result.current).toBeNull();
	});

	test('when passed a task ID that has a matching task, returns that task\'s info', () => {
		const { result } = renderHook(() => useTaskInfo(1));

		expect(result.current).toEqual(firstTaskInfo);
	});
});
