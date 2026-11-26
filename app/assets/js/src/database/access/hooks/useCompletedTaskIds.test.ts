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

import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncData';

import { insertTestData } from '../../test-utils';
import { ObjectStoreName } from '../../metadata';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { useCompletedTaskIds } from './useCompletedTaskIds';

describe('useCompletedTaskIds', () => {
	beforeEach(async () => insertTestData({
		[ObjectStoreName.DAY]: {
			4: {
				id: 4,
				year: 2026,
				month: 10,
				day: 26,
				note: '',
			},
		},
		[ObjectStoreName.DAY_TASK]: {
			3: {
				id: 3,
				day: 2,
				task: 3,
				note: '',
				summary: null,
				status: 3,
				sortIndex: null,
			},
			4: {
				id: 4,
				day: 4,
				task: 2,
				note: '',
				summary: null,
				status: 9,
				sortIndex: null,
			},
		},
	}));
	afterEach(() => cleanup());

	test('provide an AsyncActionState', () => {
		const { result } = renderHook(
			() => useCompletedTaskIds()
		);

		expect(result.current).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
		} satisfies AsyncActionState<readonly number[]>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useCompletedTaskIds()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				loading: false,
				data: [2, 3],
			} satisfies AsyncActionState<readonly number[]>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when adding a day task', async () => {
			const { result } = renderHook(
				() => useCompletedTaskIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					loading: false,
					data: [2, 3],
				} satisfies AsyncActionState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: 4,
					task: 1,
					status: 3,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					loading: false,
					data: [1, 2, 3],
				} satisfies AsyncActionState<readonly number[]>);
			});
		});

		test('when changing a day task\'s status', async () => {

			const { result } = renderHook(
				() => useCompletedTaskIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					loading: false,
					data: [2, 3],
				} satisfies AsyncActionState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK,
				id: 1,
				dayTask: {
					status: 3,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					loading: false,
					data: [2, 3, 1],
				} satisfies AsyncActionState<readonly number[]>);
			});
		});

		test('when deleting a day task', async () => {
			const { result } = renderHook(
				() => useCompletedTaskIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					loading: false,
					data: [2, 3],
				} satisfies AsyncActionState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_DELETE,
				id: 3,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					loading: false,
					data: [2],
				} satisfies AsyncActionState<readonly number[]>);
			});
		});

		test('when a completed task is deleted', async () => {
			const { result } = renderHook(
				() => useCompletedTaskIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					loading: false,
					data: [2, 3],
				} satisfies AsyncActionState<readonly number[]>);
			});

			save([{
				type: SaveType.TASK_DELETE,
				id: 3,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
					loading: false,
					data: [2],
				} satisfies AsyncActionState<readonly number[]>);
			});
		});
	});
});
