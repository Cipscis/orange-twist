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

import { useSettableStatusForTask } from './useSettableStatusForTask';

describe('useSettableStatusForTask', () => {
	beforeEach(async () => insertTestData({
		day: {
			3: {
				id: 3,
				year: 2026,
				month: 10,
				day: 10,
				note: '',
			},
		},
	}));
	afterEach(() => cleanup());

	test('provide a SettableAsyncDataResult', () => {
		const { result } = renderHook(
			() => useSettableStatusForTask(1)
		);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<number>);
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useSettableStatusForTask(1)
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: 2,
			} satisfies AsyncDataState<number>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when the latest day task changes', async () => {
			const { result } = renderHook(
				() => useSettableStatusForTask(1)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: 2,
				} satisfies AsyncDataState<number>);
			});

			save([{
				type: SaveType.DAY_TASK,
				id: 1,
				dayTask: {
					status: 3,
				},
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: 3,
				} satisfies AsyncDataState<number>);
			});
		});

		test('when the latest day task is removed', async () => {
			const { result } = renderHook(
				() => useSettableStatusForTask(1)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: 2,
				} satisfies AsyncDataState<number>);
			});

			save([{
				type: SaveType.DAY_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: 1,
				} satisfies AsyncDataState<number>);
			});
		});

		test('when a later day task is created', async () => {
			const { result } = renderHook(
				() => useSettableStatusForTask(1)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: 2,
				} satisfies AsyncDataState<number>);
			});

			await save([{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: 3,
					task: 1,
					status: 3,
				},
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: 3,
				} satisfies AsyncDataState<number>);
			});
		});
	});

	test('re-fetches data if provided a new day task ID', async () => {
		const { rerender, result } = renderHook(
			(taskId) => useSettableStatusForTask(taskId),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: 2,
			} satisfies AsyncDataState<number>);
		});

		rerender(3);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: true,
				data: 2,
			} satisfies AsyncDataState<number>);
		});

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: 1,
			} satisfies AsyncDataState<number>);
		});
	});

	test('can set data and provide optimistic results', async () => {
		const { rerender, result } = renderHook(
			(dayTask) => useSettableStatusForTask(dayTask),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: 2,
			} satisfies AsyncDataState<number>);
		});

		result.current.setData(3);
		rerender(1);

		// While the set function processes, we have optimistic data
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: 3,
		} satisfies AsyncDataState<number>);

		// Eventually, the set function completes and we still have data
		await waitFor(() => {
			expect(result.current.stateOfSet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			});
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: 3,
			} satisfies AsyncDataState<number>);
		});
	});

	test('enters error state if task could not be found', async () => {
		const { result } = renderHook(
			() => useSettableStatusForTask(-1),
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Could not find task with ID -1'),
				loading: false,
			} satisfies AsyncDataState<number>);
		});
	});
});
