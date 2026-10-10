import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
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

import { useCurrentDayTaskForTask } from './useCurrentDayTaskForTask';

describe('useCurrentDayTaskForTask', () => {
	beforeEach(async () => {
		jest.useFakeTimers({
			advanceTimers: true,
		}).setSystemTime(
			new Date(2026, 8, 29, 8)
		);

		await insertTestData({
			day: {
				1: {
					id: 1,
					year: 2026,
					month: 9,
					day: 29,
					note: 'Test day note',
				},
			},
			day_task: {
				1: {
					id: 1,
					day: 1,
					task: 1,
					summary: null,
					note: '',
					status: 1,
					sortIndex: null,
				},
			},
		});
	});
	afterEach(() => {
		jest.useRealTimers();
		cleanup();
	});

	test('provide an AsyncDataResult', () => {
		const { result } = renderHook(
			() => useCurrentDayTaskForTask(1)
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<DayTask>);
	});

	test('when a current day task exists, fetches it on initial render', async () => {
		const { result } = renderHook(
			() => useCurrentDayTaskForTask(1)
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					day: 1,
					task: 1,
					summary: null,
					note: '',
					status: 1,
					sortIndex: null,
				},
			} satisfies AsyncDataState<DayTask>);
		});
	});

	test('when no current day task exists, enters an error state', async () => {
		// Start by removing the day task
		await save([{
			type: SaveType.DAY_TASK_DELETE,
			id: 1,
		}]);

		const { result } = renderHook(
			() => useCurrentDayTaskForTask(1)
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.ERROR,
				loading: false,
				error: new Error('Could not find current day task for task 1'),
			} satisfies AsyncDataState<DayTask>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when adding a day task', async () => {
			// Start by removing the day task
			await save([{
				type: SaveType.DAY_TASK_DELETE,
				id: 1,
			}]);

			const { result } = renderHook(
				() => useCurrentDayTaskForTask(1)
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.ERROR,
					loading: false,
					error: new Error('Could not find current day task for task 1'),
				} satisfies AsyncDataState<DayTask>);
			});

			await save([{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: 1,
					task: 1,
					summary: 'Summary',
					note: 'Note',
					status: 2,
					sortIndex: 1,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 3,
						day: 1,
						task: 1,
						summary: 'Summary',
						note: 'Note',
						status: 2,
						sortIndex: 1,
					},
				} satisfies AsyncDataState<DayTask>);
			});
		});

		test('when the current day task changes', async () => {
			const { result } = renderHook(
				() => useCurrentDayTaskForTask(1)
			);

			await save([{
				type: SaveType.DAY_TASK,
				id: 1,
				dayTask: {
					summary: 'Updated',
					note: 'Updated',
					status: 2,
					sortIndex: 1,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 1,
						day: 1,
						task: 1,
						summary: 'Updated',
						note: 'Updated',
						status: 2,
						sortIndex: 1,
					},
				} satisfies AsyncDataState<DayTask>);
			});
		});

		test('if the current day task is deleted', async () => {
			const { result } = renderHook(
				() => useCurrentDayTaskForTask(1)
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 1,
						day: 1,
						task: 1,
						summary: null,
						note: '',
						status: 1,
						sortIndex: null,
					},
				} satisfies AsyncDataState<DayTask>);
			});

			await save([{
				type: SaveType.DAY_TASK_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.ERROR,
					loading: false,
					error: new Error('Could not find current day task for task 1'),
				} satisfies AsyncDataState<DayTask>);
			});
		});
	});
});
