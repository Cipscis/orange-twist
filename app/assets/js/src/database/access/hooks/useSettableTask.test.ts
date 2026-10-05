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

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { insertTestData } from '../../test-utils';
import type { Task } from '../../types';

import { useSettableTask } from './useSettableTask';

describe('useSettableTask', () => {
	beforeEach(async () => insertTestData());
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
				} satisfies Task,
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
				} satisfies Task,
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
				} satisfies Task,
			});
		});
	});

	test('re-fetches data if provided a new task ID', async () => {
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
				} satisfies Task,
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
				} satisfies Task,
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
				} satisfies Task,
			});
		});
	});

	test('can set data and provide optimistic results', async () => {
		const { rerender, result } = renderHook(
			(dayId) => useSettableTask(dayId),
			{ initialProps: 1 },
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
				} satisfies Task,
			});
		});

		result.current.setData({ note: 'Test task 1 note updated' });
		rerender(1);

		// While the set function processes, we have optimistic data
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
			// loading: false,
		});
		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: {
				id: 1,
				name: 'Test task 1',
				note: 'Test task 1 note updated',
				sortIndex: 1,
			} satisfies Task,
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
				} satisfies Task,
			});
		});
	});

	test('enters error state if task could not be found', async () => {
		const { result } = renderHook(
			() => useSettableTask(-1),
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Could not find task with ID -1'),
				loading: false,
			} satisfies AsyncDataState<Task>);
		});
	});
});
