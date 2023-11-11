import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { act, renderHook } from '@testing-library/preact';

import type { TaskInfo } from '../types';

import { tasksRegister } from '../tasksRegister';
import { TaskStatus } from 'types/TaskStatus';
import { setTaskInfo } from '../setTaskInfo';

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

	test('when passed a task ID, re-renders only when the matching task is changed', async () => {
		let renders = 0;
		const { result } = renderHook(() => {
			renders += 1;
			return useTaskInfo(1);
		});

		expect(result.current).toEqual(firstTaskInfo);
		expect(renders).toBe(1);

        // Updating a different task shouldn't cause re-renders
		await act(() => setTaskInfo(2, { name: 'New name' }));
		expect(renders).toBe(1);

        // Updating the watched task should cause re-render with new info
		await act(() => setTaskInfo(1, { name: 'New name' }));
		expect(result.current).toEqual({
			...firstTaskInfo,
			name: 'New name',
		});
		expect(renders).toBe(2);
	});

	test('when the argument changes, returns updated information', () => {
		const {
			rerender,
			result,
		} = renderHook(
			(taskId) => useTaskInfo(taskId),
			{ initialProps: 1 }
		);
		expect(result.current).toEqual(firstTaskInfo);

		rerender(2);
		expect(result.current).toEqual(secondTaskInfo);
	});
});
