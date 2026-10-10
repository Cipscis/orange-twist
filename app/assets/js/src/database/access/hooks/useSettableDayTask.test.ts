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
import type { DayTask } from '../../types';

import { useSettableDayTask } from './useSettableDayTask';

describe('useSettableDayTask', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide a SettableAsyncDataResult', () => {
		const { result } = renderHook(
			() => useSettableDayTask(1)
		);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<DayTask>);
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useSettableDayTask(1)
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					day: 1,
					task: 1,
					status: 2,
					summary: 'Summary for task 1 day 1',
					note: 'Note for task 1 day 1',
					sortIndex: 1,
				},
			} satisfies AsyncDataState<DayTask>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when the day task changes', async () => {
			const { result } = renderHook(
				() => useSettableDayTask(1)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 1,
						day: 1,
						task: 1,
						status: 2,
						summary: 'Summary for task 1 day 1',
						note: 'Note for task 1 day 1',
						sortIndex: 1,
					},
				} satisfies AsyncDataState<DayTask>);
			});

			save([{
				type: SaveType.DAY_TASK,
				id: 1,
				dayTask: {
					note: 'Test day task 1 note updated',
					sortIndex: 2,
				},
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 1,
						day: 1,
						task: 1,
						status: 2,
						summary: 'Summary for task 1 day 1',
						note: 'Test day task 1 note updated',
						sortIndex: 2,
					},
				} satisfies AsyncDataState<DayTask>);
			});
		});

		test('when the day task is removed', async () => {
			const { result } = renderHook(
				() => useSettableDayTask(1)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 1,
						day: 1,
						task: 1,
						status: 2,
						summary: 'Summary for task 1 day 1',
						note: 'Note for task 1 day 1',
						sortIndex: 1,
					},
				} satisfies AsyncDataState<DayTask>);
			});

			save([{
				type: SaveType.DAY_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.ERROR,
					loading: false,
					error: new Error('Could not find day task with ID 1'),
				} satisfies AsyncDataState<DayTask>);
			});
		});

		test('when the day task is created', async () => {
			const { result } = renderHook(
				() => useSettableDayTask(3)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.ERROR,
					loading: false,
					error: new Error('Could not find day task with ID 3'),
				} satisfies AsyncDataState<DayTask>);
			});

			save([{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: 3,
					task: 1,
				},
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 3,
						day: 3,
						task: 1,
						summary: null,
						note: '',
						status: 1,
						sortIndex: -3,
					},
				} satisfies AsyncDataState<DayTask>);
			});
		});
	});

	test('re-fetches data if provided a new day task ID', async () => {
		const { rerender, result } = renderHook(
			(taskId) => useSettableDayTask(taskId),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					day: 1,
					task: 1,
					status: 2,
					summary: 'Summary for task 1 day 1',
					note: 'Note for task 1 day 1',
					sortIndex: 1,
				},
			} satisfies AsyncDataState<DayTask>);
		});

		rerender(2);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: true,
				data: {
					id: 1,
					day: 1,
					task: 1,
					status: 2,
					summary: 'Summary for task 1 day 1',
					note: 'Note for task 1 day 1',
					sortIndex: 1,
				},
			} satisfies AsyncDataState<DayTask>);
		});

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 2,
					day: 1,
					task: 2,
					status: 2,
					summary: 'Summary for task 2 day 1',
					note: 'Note for task 2 day 1',
					sortIndex: 0,
				},
			} satisfies AsyncDataState<DayTask>);
		});
	});

	test('can set data and provide optimistic results', async () => {
		const { rerender, result } = renderHook(
			(dayTask) => useSettableDayTask(dayTask),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					day: 1,
					task: 1,
					status: 2,
					summary: 'Summary for task 1 day 1',
					note: 'Note for task 1 day 1',
					sortIndex: 1,
				},
			} satisfies AsyncDataState<DayTask>);
		});

		result.current.setData({ note: 'Test day task 1 note updated' });
		rerender(1);

		// While the set function processes, we have optimistic data
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: {
				id: 1,
				day: 1,
				task: 1,
				status: 2,
				summary: 'Summary for task 1 day 1',
				note: 'Test day task 1 note updated',
				sortIndex: 1,
			},
		} satisfies AsyncDataState<DayTask>);

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
					day: 1,
					task: 1,
					status: 2,
					summary: 'Summary for task 1 day 1',
					note: 'Test day task 1 note updated',
					sortIndex: 1,
				},
			} satisfies AsyncDataState<DayTask>);
		});
	});

	test('enters error state if day task could not be found', async () => {
		const { result } = renderHook(
			() => useSettableDayTask(-1),
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Could not find day task with ID -1'),
				loading: false,
			} satisfies AsyncDataState<DayTask>);
		});
	});
});
