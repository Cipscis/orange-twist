import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { AsyncActionStateType } from './AsyncActionStateType';
import type { AsyncActionState } from './AsyncActionState';

import { AsyncAction } from './AsyncAction';

describe('AsyncAction', () => {
	describe('updates its internal state', () => {
		test('to an initial data state on creation', () => {
			const getData = () => Promise.resolve(true);

			const action = new AsyncAction(getData);

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});

		test('to a success state when the operation succeeds', async () => {
			const { promise, resolve } = Promise.withResolvers();

			const getData = jest.fn(() => {
				resolve(true);
				return Promise.resolve(true);
			});

			const action = new AsyncAction(getData);

			expect(getData).not.toHaveBeenCalled();
			action.start();
			expect(getData).toHaveBeenCalledTimes(1);

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<boolean>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			expect(action.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});

		test('to an error state when the operation throws an error', async () => {
			const { promise, resolve } = Promise.withResolvers();

			const action = new AsyncAction(() => {
				resolve(true);
				return Promise.reject(new Error('Test rejection'));
			});

			const error = jest.fn();

			action.addEventListener('error', error);

			action.start();

			await Promise.race([promise]);
			expect(action.state).toEqual({
				type: AsyncActionStateType.ERROR,
				error: new Error('Test rejection'),
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});

		test('to its prior state when the operation is aborted', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const action = new AsyncAction(function getData(options) {
				resolve();
				return Promise.resolve(true);
			});

			const controller = new AbortController();
			const { signal } = controller;

			action.start({ signal });

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<boolean>);

			controller.abort();

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<boolean>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			// State shouldn't have updated after aborting
			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});
	});

	describe('aborts in-flight actions', () => {
		test('when the AbortSignal passed to start is aborted', () => {
			const abort = jest.fn();

			const action = new AsyncAction(
				function getData() {
					return Promise.resolve(true);
				},
			);
			action.addEventListener('abort', abort);

			const controller = new AbortController();
			const { signal } = controller;

			action.start({ signal });

			expect(abort).not.toHaveBeenCalled();
			controller.abort();
			expect(abort).toHaveBeenCalledTimes(1);

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});

		test('when the abort() method is called', () => {
			const abort = jest.fn();

			const action = new AsyncAction(
				function getData() {
					return Promise.resolve(true);
				},
			);
			action.addEventListener('abort', abort);

			action.start();

			expect(abort).not.toHaveBeenCalled();
			action.abort();
			expect(abort).toHaveBeenCalledTimes(1);

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});

		test('when the [Symbol.dispose]() method is called', () => {
			const abort = jest.fn();

			const action = new AsyncAction(
				function getData() {
					return Promise.resolve(true);
				},
			);
			action.addEventListener('abort', abort);

			action.start();

			expect(abort).not.toHaveBeenCalled();
			action[Symbol.dispose]();
			expect(abort).toHaveBeenCalledTimes(1);

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});
	});

	describe('aborts nothing when no action is in progress', () => {
		test('when the AbortSignal passed to start is aborted', async () => {
			const { promise, resolve } = Promise.withResolvers();
			const abort = jest.fn();

			const action = new AsyncAction(() => {
				resolve(true);
				return Promise.resolve(true);
			});
			action.addEventListener('abort', abort);

			const controller = new AbortController();
			const { signal } = controller;

			action.start({ signal });

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<boolean>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			expect(action.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncActionState<boolean>);

			expect(abort).not.toHaveBeenCalled();
			controller.abort();
			expect(abort).not.toHaveBeenCalled();

			expect(action.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});

		test('when the abort() method is called', async () => {
			const { promise, resolve } = Promise.withResolvers();
			const abort = jest.fn();

			const action = new AsyncAction(() => {
				resolve(true);
				return Promise.resolve(true);
			});
			action.addEventListener('abort', abort);

			action.start();

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<boolean>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			expect(action.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncActionState<boolean>);

			expect(abort).not.toHaveBeenCalled();
			action.abort();
			expect(abort).not.toHaveBeenCalled();

			expect(action.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});

		test('when the [Symbol.dispose]() method is called', async () => {
			const { promise, resolve } = Promise.withResolvers();
			const abort = jest.fn();

			const action = new AsyncAction(() => {
				resolve(true);
				return Promise.resolve(true);
			});
			action.addEventListener('abort', abort);

			action.start();

			expect(action.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<boolean>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			expect(action.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncActionState<boolean>);

			expect(abort).not.toHaveBeenCalled();
			action[Symbol.dispose]();
			expect(abort).not.toHaveBeenCalled();

			expect(action.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncActionState<boolean>);
		});
	});

	describe('reports events', () => {
		test('a loadstart event on load start', () => {
			const loadstart = jest.fn();

			const action = new AsyncAction(
				() => Promise.resolve(true),
			);
			action.addEventListener('loadstart', loadstart);

			expect(loadstart).not.toHaveBeenCalled();
			action.start();
			expect(loadstart).toHaveBeenCalledTimes(1);
		});

		test('a load event on load complete', async () => {
			const { promise, resolve } = Promise.withResolvers();
			const load = jest.fn();

			const action = new AsyncAction(
				() => {
					resolve(true);
					return Promise.resolve(true);
				},
			);
			action.addEventListener('load', load);

			action.start();

			expect(load).not.toHaveBeenCalled();
			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);
			expect(load).toHaveBeenCalledTimes(1);
		});

		test('an error event on load error', async () => {
			const { promise, resolve } = Promise.withResolvers();
			const error = jest.fn();

			const action = new AsyncAction(
				() => {
					resolve(true);
					return Promise.reject(new Error('Test rejection'));
				},
			);
			action.addEventListener('error', error);

			action.start();

			expect(error).not.toHaveBeenCalled();
			await Promise.race([promise]);
			expect(error).toHaveBeenCalledTimes(1);
		});

		test('an abort event on abort', () => {
			const abort = jest.fn();

			const action = new AsyncAction(
				function getData() {
					return Promise.resolve(true);
				},
			);
			action.addEventListener('abort', abort);

			const controller = new AbortController();
			const { signal } = controller;

			action.start({ signal });

			expect(abort).not.toHaveBeenCalled();
			controller.abort();
			expect(abort).toHaveBeenCalledTimes(1);
		});

		describe('a loadend event on load end', () => {
			test('when load succeeds', async () => {
				const { promise, resolve } = Promise.withResolvers();
				const loadend = jest.fn();

				const action = new AsyncAction(
					() => {
						resolve(true);
						return Promise.resolve(true);
					},
				);
				action.addEventListener('loadend', loadend);

				action.start();

				expect(loadend).not.toHaveBeenCalled();
				// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
				await Promise.race([promise]);
				expect(loadend).toHaveBeenCalledTimes(1);
			});

			test('when load fails', async () => {
				const { promise, resolve } = Promise.withResolvers();
				const loadend = jest.fn();

				const action = new AsyncAction(
					() => {
						resolve(true);
						return Promise.reject(new Error('Test rejection'));
					},
				);
				action.addEventListener('loadend', loadend);

				action.start();

				expect(loadend).not.toHaveBeenCalled();
				await Promise.race([promise]);
				expect(loadend).toHaveBeenCalledTimes(1);
			});

			test('when load is aborted', () => {
				const loadend = jest.fn();

				const action = new AsyncAction(
					function getData(options) {
						return Promise.resolve(true);
					},
				);
				action.addEventListener('loadend', loadend);

				const controller = new AbortController();
				const { signal } = controller;

				action.start({ signal });

				expect(loadend).not.toHaveBeenCalled();
				controller.abort();
				expect(loadend).toHaveBeenCalledTimes(1);
			});
		});
	});
});
