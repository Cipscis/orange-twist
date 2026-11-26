import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { AsyncActionStateType } from './AsyncActionStateType';
import type { AsyncActionState } from './AsyncActionState';

import { SettableData } from './SettableData';

describe('SettableData', () => {
	describe('updates its internal state', () => {
		test('to an initial state on creation', () => {
			const settableData = new SettableData({
				setData(_data, _signal) {
					return Promise.resolve();
				},
			});

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<void>);
		});

		test('to a success state when `setData` is called successfully', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const settableData = new SettableData({
				setData(_data, _signal) {
					resolve();
					return Promise.resolve();
				},
			});

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<void>);

			settableData.setData({});

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<void>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: undefined,
				loading: false,
			} satisfies AsyncActionState<void>);
		});

		test('to an error state when `setData` is called and throws an error', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const settableData = new SettableData({
				setData(_data, _signal) {
					resolve();
					return Promise.reject(new Error('Test error'));
				},
			});

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<void>);

			settableData.setData({});

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<void>);

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.ERROR,
				error: new Error('Test error'),
				loading: false,
			} satisfies AsyncActionState<void>);
		});

		test('to its prior state when `setData` is aborted', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();

			const settableData = new SettableData({
				setData(_data, _signal) {
					resolve();
					return Promise.resolve();
				},
			});

			settableData.setData({});

			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: undefined,
				loading: false,
			} satisfies AsyncActionState<void>);

			settableData.setData({});

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: undefined,
				loading: true,
			} satisfies AsyncActionState<void>);

			settableData.abort();

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: undefined,
				loading: false,
			} satisfies AsyncActionState<void>);
		});
	});

	describe('reports events', () => {
		test('a loadstart event on set start', () => {
			const loadstart = jest.fn();

			const settableData = new SettableData({
				setData(_data, _signal) {
					return Promise.resolve();
				},
			});
			settableData.addEventListener('loadstart', loadstart);

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<void>);

			expect(loadstart).not.toHaveBeenCalled();
			settableData.setData({});
			expect(loadstart).toHaveBeenCalledTimes(1);
		});

		test('a load event on set complete', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();
			const load = jest.fn();

			const settableData = new SettableData({
				setData(_data, _signal) {
					resolve();
					return Promise.resolve();
				},
			});
			settableData.addEventListener('load', load);

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<void>);

			settableData.setData({});

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<void>);

			expect(load).not.toHaveBeenCalled();
			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);
			expect(load).toHaveBeenCalledTimes(1);

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: undefined,
				loading: false,
			} satisfies AsyncActionState<void>);
		});

		test('an error event on set failure', async () => {
			const { promise, resolve } = Promise.withResolvers<void>();
			const error = jest.fn();

			const settableData = new SettableData({
				setData(_data, _signal) {
					resolve();
					return Promise.reject(new Error('Test error'));
				},
			});
			settableData.addEventListener('error', error);

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: false,
			} satisfies AsyncActionState<void>);

			settableData.setData({});

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<void>);

			expect(error).not.toHaveBeenCalled();
			// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
			await Promise.race([promise]);
			expect(error).toHaveBeenCalledTimes(1);

			expect(settableData.state).toEqual({
				type: AsyncActionStateType.ERROR,
				error: new Error('Test error'),
				loading: false,
			} satisfies AsyncActionState<void>);
		});

		test('an abort event on abort', () => {
			const abort = jest.fn();

			const settableData = new SettableData({
				setData(_data, _signal) {
					return Promise.resolve();
				},
			});
			settableData.addEventListener('abort', abort);

			settableData.setData({});

			expect(abort).not.toHaveBeenCalled();
			settableData.abort();
			expect(abort).toHaveBeenCalledTimes(1);
		});

		describe('a loadend event on load end', () => {
			test('when set succeeds', async () => {
				const { promise, resolve } = Promise.withResolvers<void>();
				const loadend = jest.fn();

				const settableData = new SettableData({
					setData(_data, _signal) {
						resolve();
						return Promise.resolve();
					},
				});
				settableData.addEventListener('loadend', loadend);

				expect(settableData.state).toEqual({
					type: AsyncActionStateType.INITIAL,
					loading: false,
				} satisfies AsyncActionState<void>);

				settableData.setData({});

				expect(settableData.state).toEqual({
					type: AsyncActionStateType.INITIAL,
					loading: true,
				} satisfies AsyncActionState<void>);

				expect(loadend).not.toHaveBeenCalled();
				// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
				await Promise.race([promise]);
				expect(loadend).toHaveBeenCalledTimes(1);

				expect(settableData.state).toEqual({
					type: AsyncActionStateType.SUCCESS,
					data: undefined,
					loading: false,
				} satisfies AsyncActionState<void>);
			});

			test('when set fails', async () => {
				const { promise, resolve } = Promise.withResolvers<void>();
				const loadend = jest.fn();

				const settableData = new SettableData({
					setData(_data, _signal) {
						resolve();
						return Promise.reject(new Error('Test error'));
					},
				});
				settableData.addEventListener('loadend', loadend);

				expect(settableData.state).toEqual({
					type: AsyncActionStateType.INITIAL,
					loading: false,
				} satisfies AsyncActionState<void>);

				settableData.setData({});

				expect(settableData.state).toEqual({
					type: AsyncActionStateType.INITIAL,
					loading: true,
				} satisfies AsyncActionState<void>);

				expect(loadend).not.toHaveBeenCalled();
				// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
				await Promise.race([promise]);
				expect(loadend).toHaveBeenCalledTimes(1);

				expect(settableData.state).toEqual({
					type: AsyncActionStateType.ERROR,
					error: new Error('Test error'),
					loading: false,
				} satisfies AsyncActionState<void>);
			});

			test('when set is aborted', () => {
				const loadend = jest.fn();

				const settableData = new SettableData({
					setData(_data, _signal) {
						return Promise.resolve();
					},
				});
				settableData.addEventListener('loadend', loadend);

				settableData.setData({});

				expect(loadend).not.toHaveBeenCalled();
				settableData.abort();
				expect(loadend).toHaveBeenCalledTimes(1);
			});
		});
	});

	test('when `setData` is called, calls `setData` function provided as an option', () => {
		const setData = jest.fn(() => Promise.resolve());

		const settableData = new SettableData({ setData });

		expect(setData).not.toHaveBeenCalled();
		settableData.setData({});
		expect(setData).toHaveBeenCalledTimes(1);
	});

	describe('aborts the `AbortSignal` passed to `setData`', () => {
		test('when `setData` is called again', () => {
			let signal: AbortSignal | null = null;

			const settableData = new SettableData({
				setData(_data, setDataSignal) {
					if (!signal) {
						signal = setDataSignal;
					}
					return Promise.resolve();
				},
			});

			settableData.setData({});
			expect(signal!.aborted).toBe(false);

			settableData.setData({});
			expect(signal!.aborted).toBe(true);
		});

		test('when `abort` is called', () => {
			let signal: AbortSignal | null = null;

			const settableData = new SettableData({
				setData(_data, setDataSignal) {
					if (!signal) {
						signal = setDataSignal;
					}
					return Promise.resolve();
				},
			});

			settableData.setData({});

			expect(signal!.aborted).toBe(false);
			settableData.abort();
			expect(signal!.aborted).toBe(true);
		});

		test('when disposed', () => {
			let signal: AbortSignal | null = null;

			const settableData = new SettableData({
				setData(_data, setDataSignal) {
					if (!signal) {
						signal = setDataSignal;
					}
					return Promise.resolve();
				},
			});

			settableData.setData({});

			expect(signal!.aborted).toBe(false);
			settableData[Symbol.dispose]();
			expect(signal!.aborted).toBe(true);
		});
	});
});
