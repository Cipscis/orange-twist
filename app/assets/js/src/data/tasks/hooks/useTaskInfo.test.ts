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
import { clear } from '../../shared';

import { useTaskInfo } from './useTaskInfo';

const firstTaskInfo: TaskInfo = {
	id: 1,
	name: 'First task',
	status: TaskStatus.TODO,
	note: '',
	sortIndex: -1,
};

const secondTaskInfo: TaskInfo = {
	id: 2,
	name: 'Second task',
	status: TaskStatus.IN_PROGRESS,
	note: 'Note',
	sortIndex: -1,
};

const thirdTaskInfo: TaskInfo = {
	id: 3,
	name: 'Third task',
	status: TaskStatus.COMPLETED,
	note: 'Task note',
	sortIndex: -1,
};

describe('useTaskInfo', () => {
	beforeEach(() => {
		tasksRegister.set([
			[1, firstTaskInfo],
			[2, secondTaskInfo],
			[3, thirdTaskInfo],
		]);
	});

	afterEach(() => {
		clear();
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
		let renderCount = 0;
		const { result } = renderHook(() => {
			renderCount += 1;
			return useTaskInfo(1);
		});

		expect(result.current).toEqual(firstTaskInfo);
		expect(renderCount).toBe(1);

		// Updating a different task shouldn't cause re-renders
		await act(() => setTaskInfo(2, { name: 'New name' }));
		expect(renderCount).toBe(1);

		// Updating a watched task should cause re-render with new info
		await act(() => setTaskInfo(1, { name: 'New name' }));
		expect(result.current).toEqual({
			...firstTaskInfo,
			name: 'New name',
		});
		expect(renderCount).toBe(2);
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
