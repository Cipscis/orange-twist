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

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { insertTestData } from '../../test-utils';
import type { Task } from '../../types';

import { useAllTasks } from './useAllTasks';

describe('useAllTasks', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide a AsyncDataResult', () => {
		const { result } = renderHook(
			() => useAllTasks()
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<readonly Task[]>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useAllTasks()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [
					{
						id: 3,
						name: 'Test task 3',
						note: 'Test task 3 note',
						sortIndex: 0,
					},
					{
						id: 1,
						name: 'Test task 1',
						note: 'Test task 1 note',
						sortIndex: 1,
					},
					{
						id: 2,
						name: 'Test task 2',
						note: 'Test task 2 note',
						sortIndex: 2,
					},
				],
			} satisfies AsyncDataState<readonly Task[]>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when a task changes', async () => {
			const { result } = renderHook(
				() => useAllTasks()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [
						{
							id: 3,
							name: 'Test task 3',
							note: 'Test task 3 note',
							sortIndex: 0,
						},
						{
							id: 1,
							name: 'Test task 1',
							note: 'Test task 1 note',
							sortIndex: 1,
						},
						{
							id: 2,
							name: 'Test task 2',
							note: 'Test task 2 note',
							sortIndex: 2,
						},
					],
				} satisfies AsyncDataState<readonly Task[]>);
			});

			await save([{
				type: SaveType.TASK,
				id: 1,
				task: {
					name: 'Test task 1 updated',
					note: 'Test task 1 note updated',
					sortIndex: 2,
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [
						{
							id: 3,
							name: 'Test task 3',
							note: 'Test task 3 note',
							sortIndex: 0,
						},
						{
							id: 1,
							name: 'Test task 1 updated',
							note: 'Test task 1 note updated',
							sortIndex: 2,
						},
						{
							id: 2,
							name: 'Test task 2',
							note: 'Test task 2 note',
							sortIndex: 2,
						},
					],
				} satisfies AsyncDataState<readonly Task[]>);
			});
		});

		test('when a task is removed', async () => {
			const { result } = renderHook(
				() => useAllTasks()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [
						{
							id: 3,
							name: 'Test task 3',
							note: 'Test task 3 note',
							sortIndex: 0,
						},
						{
							id: 1,
							name: 'Test task 1',
							note: 'Test task 1 note',
							sortIndex: 1,
						},
						{
							id: 2,
							name: 'Test task 2',
							note: 'Test task 2 note',
							sortIndex: 2,
						},
					],
				} satisfies AsyncDataState<readonly Task[]>);
			});

			save([{
				type: SaveType.TASK_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [
						{
							id: 3,
							name: 'Test task 3',
							note: 'Test task 3 note',
							sortIndex: 0,
						},
						{
							id: 2,
							name: 'Test task 2',
							note: 'Test task 2 note',
							sortIndex: 2,
						},
					],
				} satisfies AsyncDataState<readonly Task[]>);
			});
		});

		test('when a task is created', async () => {
			const { result } = renderHook(
				() => useAllTasks()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [
						{
							id: 3,
							name: 'Test task 3',
							note: 'Test task 3 note',
							sortIndex: 0,
						},
						{
							id: 1,
							name: 'Test task 1',
							note: 'Test task 1 note',
							sortIndex: 1,
						},
						{
							id: 2,
							name: 'Test task 2',
							note: 'Test task 2 note',
							sortIndex: 2,
						},
					],
				} satisfies AsyncDataState<readonly Task[]>);
			});

			save([{
				type: SaveType.TASK_ADD,
				task: {
					name: 'New task',
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [
						{
							id: 4,
							name: 'New task',
							note: '',
							sortIndex: -4,
						},
						{
							id: 3,
							name: 'Test task 3',
							note: 'Test task 3 note',
							sortIndex: 0,
						},
						{
							id: 1,
							name: 'Test task 1',
							note: 'Test task 1 note',
							sortIndex: 1,
						},
						{
							id: 2,
							name: 'Test task 2',
							note: 'Test task 2 note',
							sortIndex: 2,
						},
					],
				} satisfies AsyncDataState<readonly Task[]>);
			});
		});
	});
});
