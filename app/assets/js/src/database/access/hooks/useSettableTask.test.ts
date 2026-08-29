import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import {
	cleanup,
	renderHook,
	waitFor,
} from '@testing-library/preact';

import { AsyncDataStateType } from 'utils';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { createTestData } from '../../test-utils';
import type { DatabaseData } from '../../types';
import type { ObjectStoreName } from '../../metadata';

import { useSettableTask } from './useSettableTask';

describe('useSettableTask', () => {
	beforeEach(async () => createTestData());
	afterEach(() => cleanup());

	test('provide a SettableAsyncDataResult', () => {
		const { result } = renderHook(
			() => useSettableTask(1)
		);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useSettableTask(1)
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});
	});

	test('re-fetches data if it changes', async () => {
		const { result } = renderHook(
			() => useSettableTask(1)
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});

		save([{
			type: SaveType.TASK,
			id: 1,
			task: {
				name: 'Test task 1 updated',
				note: 'Test task 1 note updated',
				sortIndex: 2,
			},
		}]);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Test task 1 updated',
					note: 'Test task 1 note updated',
					sortIndex: 2,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});
	});

	test('re-fetches data it provided a new task ID', async () => {
		const { rerender, result } = renderHook(
			(taskId) => useSettableTask(taskId),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});

		rerender(2);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: true,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 2,
					name: 'Test task 2',
					note: 'Test task 2 note',
					sortIndex: 2,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});
	});

	test('can set data and provide optimistic results', async () => {
		const { result } = renderHook(
			() => useSettableTask(1),
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});

		result.current.setData({ note: 'Test task 1 note updated' });

		// While the set function processes, we have optimistic data
		await waitFor(() => {
			expect(result.current.stateOfSet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				// loading: true,
				loading: false,
			});
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note updated',
					sortIndex: 1,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});

		// Eventually, the set function completes and we still have data
		await waitFor(() => {
			expect(result.current.stateOfSet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			});
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note updated',
					sortIndex: 1,
				} satisfies DatabaseData[typeof ObjectStoreName.TASK][number],
			});
		});
	});
});
