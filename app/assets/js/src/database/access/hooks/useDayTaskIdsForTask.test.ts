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

import { insertTestData } from '../../test-utils';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { useDayTaskIdsForTask } from './useDayTaskIdsForTask';

describe('useDayTaskIdsForTask', () => {
	beforeEach(async () => insertTestData({
		day_task: {
			1: {
				id: 1,
				day: 1,
				task: 1,
				summary: null,
				note: '',
				status: 1,
				sortIndex: -1,
			},
			2: {
				id: 2,
				day: 2,
				task: 1,
				summary: null,
				note: '',
				status: 2,
				sortIndex: -2,
			},
		},
	}));
	afterEach(() => cleanup());

	test('provide an AsyncDataResult', () => {
		const { result } = renderHook(
			() => useDayTaskIdsForTask(1)
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<readonly number[]>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useDayTaskIdsForTask(1)
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [1, 2],
			} satisfies AsyncDataState<readonly number[]>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when adding a day task', async () => {
			const { result } = renderHook(
				() => useDayTaskIdsForTask(1)
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [1, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: 3,
					task: 1,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [1, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});
		});
		test('when deleting a day task', async () => {
			const { result } = renderHook(
				() => useDayTaskIdsForTask(1)
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [1, 2],
				} satisfies AsyncDataState<readonly number[]>);
			});

			save([{
				type: SaveType.DAY_TASK_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [2],
				} satisfies AsyncDataState<readonly number[]>);
			});
		});
	});
});
