import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { AsyncDataStateType } from './AsyncDataStateType';
import type { AsyncDataState } from './AsyncDataState';

import { AsyncData } from './AsyncData';

describe('AsyncData', () => {
	describe('updates its internal state', () => {
		test('to an initial data state on creation', () => {
			const getData = () => Promise.resolve(true);

			const asyncData = new AsyncData({
				getData,
			});

			expect(asyncData.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		test('to a success state when `getData` is called', async () => {
			const { promise, resolve } = Promise.withResolvers();

			const getData = jest.fn(() => {
				resolve(true);
				return Promise.resolve(true);
			});

			const asyncData = new AsyncData({
				getData,
			});

			expect(getData).not.toHaveBeenCalled();
			asyncData.getData();
			expect(getData).toHaveBeenCalledTimes(1);

			expect(asyncData.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies AsyncDataState<boolean>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			expect(asyncData.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		test('to an error state if loading data throws an error', async () => {
			const { promise, resolve } = Promise.withResolvers();

			const asyncData = new AsyncData({
				getData: () => {
					resolve(true);
					return Promise.reject(new Error('Test rejection'));
				},
			});

			const error = jest.fn();

			asyncData.addEventListener('error', error);

			asyncData.getData();

			await Promise.race([promise]);
			expect(asyncData.state).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Test rejection'),
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		test('to its prior state when `getData` is aborted', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const asyncData = new AsyncData({
				getData(options) {
					resolve();
					return Promise.resolve(true);
				},
			});

			const controller = new AbortController();
			const { signal } = controller;

			asyncData.getData({ signal });

			expect(asyncData.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies AsyncDataState<boolean>);

			controller.abort();

			expect(asyncData.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: false,
			} satisfies AsyncDataState<boolean>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			// State shouldn't have updated after aborting
			expect(asyncData.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});
	});

	describe('reports events', () => {
		test('a loadstart event on load start', () => {
			const loadstart = jest.fn();

			const asyncData = new AsyncData({
				getData: () => Promise.resolve(true),
			});
			asyncData.addEventListener('loadstart', loadstart);

			expect(loadstart).not.toHaveBeenCalled();
			asyncData.getData();
			expect(loadstart).toHaveBeenCalledTimes(1);
		});

		test('a load event on load complete', async () => {
			const { promise, resolve } = Promise.withResolvers();
			const load = jest.fn();

			const asyncData = new AsyncData({
				getData: () => {
					resolve(true);
					return Promise.resolve(true);
				},
			});
			asyncData.addEventListener('load', load);

			asyncData.getData();

			expect(load).not.toHaveBeenCalled();
			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);
			expect(load).toHaveBeenCalledTimes(1);
		});

		test('an error event on load error', async () => {
			const { promise, resolve } = Promise.withResolvers();
			const error = jest.fn();

			const asyncData = new AsyncData({
				getData: () => {
					resolve(true);
					return Promise.reject(new Error('Test rejection'));
				},
			});
			asyncData.addEventListener('error', error);

			asyncData.getData();

			expect(error).not.toHaveBeenCalled();
			await Promise.race([promise]);
			expect(error).toHaveBeenCalledTimes(1);
		});

		test('an abort event on abort', () => {
			const abort = jest.fn();

			const asyncData = new AsyncData({
				getData(options) {
					return Promise.resolve(true);
				},
			});
			asyncData.addEventListener('abort', abort);

			const controller = new AbortController();
			const { signal } = controller;

			asyncData.getData({ signal });

			expect(abort).not.toHaveBeenCalled();
			controller.abort();
			expect(abort).toHaveBeenCalledTimes(1);
		});

		describe('a loadend event on load end', () => {
			test('when load succeeds', async () => {
				const { promise, resolve } = Promise.withResolvers();
				const loadend = jest.fn();

				const asyncData = new AsyncData({
					getData: () => {
						resolve(true);
						return Promise.resolve(true);
					},
				});
				asyncData.addEventListener('loadend', loadend);

				asyncData.getData();

				expect(loadend).not.toHaveBeenCalled();
				// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
				await Promise.race([promise]);
				expect(loadend).toHaveBeenCalledTimes(1);
			});

			test('when load fails', async () => {
				const { promise, resolve } = Promise.withResolvers();
				const loadend = jest.fn();

				const asyncData = new AsyncData({
					getData: () => {
						resolve(true);
						return Promise.reject(new Error('Test rejection'));
					},
				});
				asyncData.addEventListener('loadend', loadend);

				asyncData.getData();

				expect(loadend).not.toHaveBeenCalled();
				await Promise.race([promise]);
				expect(loadend).toHaveBeenCalledTimes(1);
			});

			test('when load is aborted', () => {
				const loadend = jest.fn();

				const asyncData = new AsyncData({
					getData(options) {
						return Promise.resolve(true);
					},
				});
				asyncData.addEventListener('loadend', loadend);

				const controller = new AbortController();
				const { signal } = controller;

				asyncData.getData({ signal });

				expect(loadend).not.toHaveBeenCalled();
				controller.abort();
				expect(loadend).toHaveBeenCalledTimes(1);
			});
		});
	});
});
