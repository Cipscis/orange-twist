import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { insertTestData } from '../test-utils';
import type { Task } from '../types';

import { ChangeEntityType } from './liveAccessManager';
import { SaveType } from './SaveAction';
import { save } from './save';

import { ObservableEntity } from './ObservableEntity';

describe('ObservableEntity', () => {
	beforeEach(() => insertTestData());

	describe('updates its internal state', () => {
		test('to an initial data state on creation', () => {
			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: 1,
			});

			expect(observable.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: false,
			} satisfies AsyncDataState<Task>);
		});

		test('to a success state when `observe` is called', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: 1,
			});

			observable.addEventListener('loadend', () => resolve());

			observable.observe();

			expect(observable.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies AsyncDataState<Task>);

			await promise;

			expect(observable.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				},
				loading: false,
			} satisfies AsyncDataState<Task>);
		});

		test('to a success state after database changes while observing', async () => {
			const { promise: promise1, resolve: resolve1 } = Promise.withResolvers<void>();

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: 1,
			});

			observable.addEventListener('loadend', () => resolve1());

			observable.observe();

			expect(observable.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies AsyncDataState<Task>);

			await promise1;

			expect(observable.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				},
				loading: false,
			} satisfies AsyncDataState<Task>);

			const { promise: promiseLoadStart, resolve: resolveLoadStart } = Promise.withResolvers<void>();
			const { promise: promiseLoadEnd, resolve: resolveLoadEnd } = Promise.withResolvers<void>();

			observable.addEventListener('loadstart', () => resolveLoadStart());
			observable.addEventListener('loadend', () => resolveLoadEnd());

			save([{
				type: SaveType.TASK,
				id: 1,
				task: {
					note: 'Updated note',
				},
			}]);

			await promiseLoadStart;

			expect(observable.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				},
				loading: true,
			} satisfies AsyncDataState<Task>);

			await promiseLoadEnd;

			expect(observable.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Updated note',
					sortIndex: 1,
				},
				loading: false,
			} satisfies AsyncDataState<Task>);
		});

		test('to an error state if task does not exist', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: -1,
			});

			observable.addEventListener('loadend', () => resolve());

			observable.observe();

			expect(observable.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies AsyncDataState<Task>);

			await promise;

			expect(observable.state).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Could not find task with ID -1'),
				loading: false,
			} satisfies AsyncDataState<Task>);
		});
	});

	describe('reports events', () => {
		test('a loadstart event on load start', () => {
			const loadstart = jest.fn();

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: 1,
			});

			observable.addEventListener('loadstart', loadstart);

			expect(loadstart).not.toHaveBeenCalled();
			observable.observe();
			expect(loadstart).toHaveBeenCalledTimes(1);
		});

		test('a load event on load complete', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();
			const load = jest.fn(() => resolve());

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: 1,
			});

			observable.addEventListener('load', load);

			observable.observe();

			expect(load).not.toHaveBeenCalled();
			await promise;
			expect(load).toHaveBeenCalledTimes(1);
			expect(observable.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					sortIndex: 1,
				},
				loading: false,
			} satisfies AsyncDataState<Task>);
		});

		test('an error event on load error', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();
			const error = jest.fn(() => resolve());

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: -1,
			});

			observable.addEventListener('error', error);

			observable.observe();

			expect(error).not.toHaveBeenCalled();
			await promise;
			expect(error).toHaveBeenCalledTimes(1);
			expect(observable.state).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Could not find task with ID -1'),
				loading: false,
			} satisfies AsyncDataState<Task>);
		});

		describe('a loadend event on load end', () => {
			test('when load succeeds', async () => {
				const { promise, resolve } = Promise.withResolvers<void>();
				const loadend = jest.fn(() => resolve());

				const observable = new ObservableEntity({
					type: ChangeEntityType.TASK,
					id: 1,
				});

				observable.addEventListener('loadend', loadend);

				observable.observe();

				expect(loadend).not.toHaveBeenCalled();
				await promise;
				expect(loadend).toHaveBeenCalledTimes(1);
			});

			test('when load fails', async () => {
				const { promise, resolve } = Promise.withResolvers<void>();
				const loadend = jest.fn(() => resolve());

				const observable = new ObservableEntity({
					type: ChangeEntityType.TASK,
					id: -1,
				});

				observable.addEventListener('loadend', loadend);

				observable.observe();

				expect(loadend).not.toHaveBeenCalled();
				await promise;
				expect(loadend).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('stops observing live database changes', () => {
		test('when `unobserve` is called', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: 1,
			});

			observable.addEventListener('loadend', () => resolve());
			observable.observe();

			await promise;

			observable.unobserve();

			const spy = jest.fn();
			observable.addEventListener('loadstart', spy);

			save([{
				type: SaveType.TASK,
				id: 1,
				task: {
					name: 'Updated name',
				},
			}]);

			// No easy way to test that a Promise _doesn't_ resolve, so just race it against a timeout
			await new Promise((resolve) => setTimeout(resolve, 300));

			expect(spy).not.toHaveBeenCalled();
		});

		test('when an `AbortSignal` passed to `observe` is aborted', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: 1,
			});

			const controller = new AbortController();
			const { signal } = controller;

			observable.addEventListener('loadend', () => resolve());
			observable.observe({ signal });

			await promise;

			controller.abort();

			const spy = jest.fn();
			observable.addEventListener('loadstart', spy);

			save([{
				type: SaveType.TASK,
				id: 1,
				task: {
					name: 'Updated name',
				},
			}]);

			// No easy way to test that a Promise _doesn't_ resolve, so just race it against a timeout
			await new Promise((resolve) => setTimeout(resolve, 300));

			expect(spy).not.toHaveBeenCalled();
		});

		test('when disposed', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const observable = new ObservableEntity({
				type: ChangeEntityType.TASK,
				id: 1,
			});

			observable.addEventListener('loadend', () => resolve());
			observable.observe();

			await promise;

			observable[Symbol.dispose]();

			const spy = jest.fn();
			observable.addEventListener('loadstart', spy);

			save([{
				type: SaveType.TASK,
				id: 1,
				task: {
					name: 'Updated name',
				},
			}]);

			// No easy way to test that a Promise _doesn't_ resolve, so just race it against a timeout
			await new Promise((resolve) => setTimeout(resolve, 300));

			expect(spy).not.toHaveBeenCalled();
		});
	});
});
