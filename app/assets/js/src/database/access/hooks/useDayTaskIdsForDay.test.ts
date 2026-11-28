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

import { insertTestData } from '../../test-utils';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { useDayTaskIdsForDay } from './useDayTaskIdsForDay';

describe('useDayTaskIdsForDay', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide an AsyncActionState', () => {
		const { result } = renderHook(
			() => useDayTaskIdsForDay(1)
		);

		expect(result.current).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
			progress: null,
		} satisfies AsyncActionState<readonly number[]>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useDayTaskIdsForDay(1)
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: [2, 1],
				loading: false,
				progress: null,
			} satisfies AsyncActionState<readonly number[]>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when adding a day task', async () => {
			const { result } = renderHook(
				() => useDayTaskIdsForDay(1)
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: [2, 1],
					loading: false,
					progress: null,
				} satisfies AsyncActionState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: 1,
					task: 3,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: [3, 2, 1],
					loading: false,
					progress: null,
				} satisfies AsyncActionState<readonly number[]>);
			});
		});
		test('when updating a day task sort index', async () => {
			const { result } = renderHook(
				() => useDayTaskIdsForDay(1)
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: [2, 1],
					loading: false,
					progress: null,
				} satisfies AsyncActionState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK,
				id: 1,
				dayTask: {
					sortIndex: -1,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: [1, 2],
					loading: false,
					progress: null,
				} satisfies AsyncActionState<readonly number[]>);
			});
		});
		test('when deleting a day task', async () => {
			const { result } = renderHook(
				() => useDayTaskIdsForDay(1)
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: [2, 1],
					loading: false,
					progress: null,
				} satisfies AsyncActionState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: [2],
					loading: false,
					progress: null,
				} satisfies AsyncActionState<readonly number[]>);
			});
		});
	});
});
