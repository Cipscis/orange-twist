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

import {
	AsyncDataStateType,
	type AsyncDataState,
	type SettableAsyncDataState,
} from 'utils/asyncData';

import { insertTestData } from '../../test-utils';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { useSettableDayTaskIdsForDay } from './useSettableDayTaskIdsForDay';

describe('useSettableDayTaskIdsForDay', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide a SettableAsyncDataResult', () => {
		const { result } = renderHook(
			() => useSettableDayTaskIdsForDay(1)
		);

		expect(result.current.getterState).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<readonly number[]>);
		expect(result.current.setterState).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		} satisfies SettableAsyncDataState);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useSettableDayTaskIdsForDay(1)
		);

		await waitFor(() => {
			expect(result.current.getterState).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [2, 1],
			} satisfies AsyncDataState<readonly number[]>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when adding a day task', async () => {
			const { result } = renderHook(
				() => useSettableDayTaskIdsForDay(1)
			);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [2, 1],
				} satisfies AsyncDataState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: 1,
					task: 3,
				},
			}]);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 2, 1],
				} satisfies AsyncDataState<readonly number[]>);
			});
		});
		test('when updating a day task sort index', async () => {
			const { result } = renderHook(
				() => useSettableDayTaskIdsForDay(1)
			);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [2, 1],
				} satisfies AsyncDataState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK,
				id: 1,
				dayTask: {
					sortIndex: -1,
				},
			}]);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [1, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});
		});
		test('when deleting a day task', async () => {
			const { result } = renderHook(
				() => useSettableDayTaskIdsForDay(1)
			);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [2, 1],
				} satisfies AsyncDataState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current.getterState).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [2],
				} satisfies AsyncDataState<readonly number[]>);
			});
		});
	});

	test('can set data and provide optimistic results', async () => {
		const { rerender, result } = renderHook(
			(dayId) => useSettableDayTaskIdsForDay(dayId),
			{ initialProps: 1 },
		);

		await waitFor(() => {
			expect(result.current.getterState).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [2, 1],
			} satisfies AsyncDataState<readonly number[]>);
		});

		result.current.setData([1, 2]);
		rerender(1);

		// While the set function processes, we have optimistic data
		expect(result.current.setterState).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
		expect(result.current.getterState).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: [1, 2],
		} satisfies AsyncDataState<readonly number[]>);

		// Eventually, the set function completes and we still have data
		await waitFor(() => {
			expect(result.current.setterState).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			});
			expect(result.current.getterState).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [1, 2],
			} satisfies AsyncDataState<readonly number[]>);
		});
	});
});
