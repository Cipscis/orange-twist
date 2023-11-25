import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { act, renderHook } from '@testing-library/preact';

import { useMemo } from 'preact/hooks';

import type { TaskInfo } from '../types';

import { tasksRegister } from '../tasksRegister';
import { TaskStatus } from 'types/TaskStatus';
import { setTaskInfo } from '../setTaskInfo';
import { clear } from '../../shared';

import { useAllTaskInfo } from './useAllTaskInfo';

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

const thirdTaskInfo: TaskInfo = {
	id: 3,
	name: 'Third task',
	status: TaskStatus.COMPLETED,
};

describe('useAllTaskInfo', () => {
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

	test('when passed no arguments, if there are no tasks, returns an empty array', () => {
		tasksRegister.clear();

		const { result } = renderHook(() => useAllTaskInfo());
		expect(result.current).toEqual([]);
	});

	test('when passed no arguments, returns an array of info on all tasks', () => {
		const { result } = renderHook(() => useAllTaskInfo());

		expect(result.current).toEqual([firstTaskInfo, secondTaskInfo, thirdTaskInfo]);
	});

	test('when passed multiple task IDs, returns an array of those tasks\' info', () => {
		const { result } = renderHook(() => useAllTaskInfo(useMemo(() => [1, 3], [])));

		expect(result.current).toEqual([firstTaskInfo, thirdTaskInfo]);
	});

	test('when passed multiple task IDs, re-renders only when a matching task is changed', async () => {
		let renderCount = 0;
		const { result } = renderHook(() => {
			renderCount += 1;
			return useAllTaskInfo(useMemo(() => [1, 3], []));
		});

		expect(result.current).toEqual([firstTaskInfo, thirdTaskInfo]);
		expect(renderCount).toBe(1);

		// Updating a different task shouldn't cause re-renders
		await act(() => setTaskInfo(2, { name: 'New name' }));
		expect(renderCount).toBe(1);

		// Updating the watched task should cause re-render with new info
		await act(() => setTaskInfo(1, { name: 'New name' }));
		expect(result.current).toEqual([
			{
				...firstTaskInfo,
				name: 'New name',
			},
			thirdTaskInfo,
		]);
		expect(renderCount).toBe(2);

		// Updating a watched task should cause re-render with new info
		await act(() => setTaskInfo(3, { name: 'New name' }));
		expect(result.current).toEqual([
			{
				...firstTaskInfo,
				name: 'New name',
			},
			{
				...thirdTaskInfo,
				name: 'New name',
			},
		]);
		expect(renderCount).toBe(3);
	});

	test('when the argument changes, returns updated information', () => {
		const {
			rerender,
			result,
		} = renderHook(
			(taskId) => useAllTaskInfo(taskId),
			{ initialProps: [1] }
		);
		expect(result.current).toEqual([firstTaskInfo]);

		rerender([2]);
		expect(result.current).toEqual([secondTaskInfo]);

		rerender([1, 3]);
		expect(result.current).toEqual([firstTaskInfo, thirdTaskInfo]);

		rerender();
		expect(result.current).toEqual([firstTaskInfo, secondTaskInfo, thirdTaskInfo]);
	});
});
