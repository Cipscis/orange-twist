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

import { AsyncDataStateType, type AsyncDataState } from 'utils/asyncData';

import { insertTestData } from '../../test-utils';
import { ObjectStoreName } from '../../metadata';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { useUnfinishedTaskIds } from './useUnfinishedTaskIds';

describe('useUnfinishedTaskIds', () => {
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
				task: 1,
				note: '',
				summary: null,
				status: 3,
				sortIndex: null,
			},
			4: {
				id: 4,
				day: 3,
				task: 2,
				note: '',
				summary: null,
				status: 3,
				sortIndex: null,
			},
		},
	}));
	afterEach(() => cleanup());

	test('provide an AsyncDataResult', () => {
		const { result } = renderHook(
			() => useUnfinishedTaskIds()
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<readonly number[]>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useUnfinishedTaskIds()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [3, 2],
			} satisfies AsyncDataState<readonly number[]>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when adding a day task', async () => {
			const { result } = renderHook(
				() => useUnfinishedTaskIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: 4,
					task: 1,
					status: 2,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 1, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});
		});
		test('when changing a day task\'s status', async () => {

			const { result } = renderHook(
				() => useUnfinishedTaskIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK,
				id: 3,
				dayTask: {
					status: 2,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 1, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});
		});
		test('when deleting a day task', async () => {
			const { result } = renderHook(
				() => useUnfinishedTaskIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_DELETE,
				id: 3,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 1, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});
		});
	});
});
