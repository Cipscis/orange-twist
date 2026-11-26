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
import type { Task } from '../../types';

import { useAllTasks } from './useAllTasks';

describe('useAllTasks', () => {
	beforeEach(() => insertTestData());
	afterEach(() => cleanup());

	test('provide a AsyncActionState', () => {
		const { result } = renderHook(
			() => useAllTasks()
		);

		expect(result.current).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
		} satisfies AsyncActionState<readonly Task[]>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useAllTasks()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
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
			} satisfies AsyncActionState<readonly Task[]>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when a task changes', async () => {
			const { result } = renderHook(
				() => useAllTasks()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
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
				} satisfies AsyncActionState<readonly Task[]>);
			});

			save([{
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
					type: AsyncActionStateType.SUCCESS,
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
				} satisfies AsyncActionState<readonly Task[]>);
			});
		});

		test('when a task is removed', async () => {
			const { result } = renderHook(
				() => useAllTasks()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
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
				} satisfies AsyncActionState<readonly Task[]>);
			});

			save([{
				type: SaveType.TASK_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
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
				} satisfies AsyncActionState<readonly Task[]>);
			});
		});

		test('when a task is created', async () => {
			const { result } = renderHook(
				() => useAllTasks()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
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
				} satisfies AsyncActionState<readonly Task[]>);
			});

			save([{
				type: SaveType.TASK_ADD,
				task: {
					name: 'New task',
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncActionStateType.SUCCESS,
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
				} satisfies AsyncActionState<readonly Task[]>);
			});
		});
	});
});
