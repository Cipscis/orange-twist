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

import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncAction';

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

		expect(result.current.getterState).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
			progress: null,
		} satisfies AsyncActionState<number>);
		expect(result.current.setterState).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: false,
			progress: null,
		} satisfies AsyncActionState<void>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useSettableStatusForTask(1)
		);

		await waitFor(() => {
			expect(result.current.getterState).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 2,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<number>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when the latest day task changes', async () => {
			const { result } = renderHook(
				() => useSettableStatusForTask(1)
			);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: 2,
					loading: false,
					progress: null,
				} satisfies AsyncActionState<number>);
			});

			save([{
				type: SaveType.DAY_TASK,
				id: 1,
				dayTask: {
					status: 3,
				},
			}]);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: 3,
					loading: false,
					progress: null,
				} satisfies AsyncActionState<number>);
			});
		});

		test('when the latest day task is removed', async () => {
			const { result } = renderHook(
				() => useSettableStatusForTask(1)
			);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: 2,
					loading: false,
					progress: null,
				} satisfies AsyncActionState<number>);
			});

			save([{
				type: SaveType.DAY_TASK_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: 1,
					loading: false,
					progress: null,
				} satisfies AsyncActionState<number>);
			});
		});

		test('when a later day task is created', async () => {
			const { result } = renderHook(
				() => useSettableStatusForTask(1)
			);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: 2,
					loading: false,
					progress: null,
				} satisfies AsyncActionState<number>);
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
				expect(result.current.getterState).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: 3,
					loading: false,
					progress: null,
				} satisfies AsyncActionState<number>);
			});
		});
	});

	test('re-fetches data if provided a new day task ID', async () => {
		const { rerender, result } = renderHook(
			(taskId) => useSettableStatusForTask(taskId),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.getterState).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 2,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<number>);
		});

		rerender(3);

		await waitFor(() => {
			expect(result.current.getterState).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 2,
				loading: true,
				progress: null,
			} satisfies AsyncActionState<number>);
		});

		await waitFor(() => {
			expect(result.current.getterState).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 1,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<number>);
		});
	});

	test('can set data and provide optimistic results', async () => {
		const { rerender, result } = renderHook(
			(dayTask) => useSettableStatusForTask(dayTask),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.getterState).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 2,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<number>);
		});

		result.current.setData(3);
		rerender(1);

		// While the set function processes, we have optimistic data
		expect(result.current.setterState).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
			progress: null,
		} satisfies AsyncActionState<void>);
		expect(result.current.getterState).toEqual({
			type: AsyncActionStateType.SUCCESS,
			data: 3,
			loading: false,
			progress: null,
		} satisfies AsyncActionState<number>);

		// Eventually, the set function completes and we still have data
		await waitFor(() => {
			expect(result.current.setterState).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: undefined,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<void>);
			expect(result.current.getterState).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 3,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<number>);
		});
	});

	test('enters error state if task could not be found', async () => {
		const { result } = renderHook(
			() => useSettableStatusForTask(-1),
		);

		await waitFor(() => {
			expect(result.current.getterState).toEqual({
				type: AsyncActionStateType.ERROR,
				error: new Error('Could not find task with ID -1'),
				loading: false,
				progress: null,
			} satisfies AsyncActionState<number>);
		});
	});
});
