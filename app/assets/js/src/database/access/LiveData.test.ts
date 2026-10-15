import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import {
	AsyncDataStateType,
	type AsyncDataState,
} from 'utils';

import { LiveData } from './LiveData';

describe('LiveData', () => {
	const noop = () => {};

	describe('updates its internal state', () => {
		test('to an initial data state on creation', () => {
			const getData = () => Promise.resolve(true);

			const liveData = new LiveData({
				getData,
				observe: noop,
			});

			expect(liveData.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		test('to a success state when `observe` is called', async () => {
			const { promise, resolve } = Promise.withResolvers();

			const getData = jest.fn(() => {
				resolve(true);
				return Promise.resolve(true);
			});

			const liveData = new LiveData({
				getData,
				observe: noop,
			});

			expect(getData).not.toHaveBeenCalled();
			liveData.observe();
			expect(getData).toHaveBeenCalledTimes(1);

			expect(liveData.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies AsyncDataState<boolean>);

			await promise;

			expect(liveData.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		test('to a success state if a change is detected while observing', async () => {
			const {
				promise: promiseInitialLoad,
				resolve: resolveInitialLoad,
			} = Promise.withResolvers<void>();
			const {
				promise: promiseObserveChange,
				resolve: resolveObserveChange,
			} = Promise.withResolvers<void>();
			const {
				promise: promiseObservedChange,
				resolve: resolveObservedChange,
			} = Promise.withResolvers<void>();

			/** Change this to change the next retrieved value */
			let value = true;
			const getData = jest.fn(() => {
				resolveInitialLoad();
				return Promise.resolve(value);
			});

			const liveData = new LiveData({
				getData,
				observe: (getData) => {
					// Allow us to trigger observing a change
					promiseObserveChange.then(() => getData());
				},
			});

			liveData.observe();

			await promiseInitialLoad;

			// Initial load should load `true`
			expect(liveData.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncDataState<boolean>);

			// Prepare to detect a change and load `false`
			value = false;
			liveData.addEventListener('loadend', () => resolveObservedChange());

			// Trigger a change detection
			resolveObserveChange();
			await promiseObserveChange;

			// First we load
			expect(liveData.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: true,
			} satisfies AsyncDataState<boolean>);

			// Trigger end of loading
			resolveObservedChange();
			await promiseObservedChange;

			// Check the new value is `false`
			expect(liveData.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: false,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		test('to an error state if loading data throws an error', async () => {
			const { promise, resolve } = Promise.withResolvers();

			const liveData = new LiveData({
				getData: () => {
					resolve(true);
					return Promise.reject(new Error('Test rejection'));
				},
				observe: noop,
			});

			const error = jest.fn();

			liveData.addEventListener('error', error);

			liveData.observe();

			// Pass noop to prevent test failure due to error in promise
			await promise.catch(noop);
			expect(liveData.state).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Test rejection'),
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});
	});

	describe('reports events', () => {
		test('a loadstart event on load start', () => {
			const liveData = new LiveData({
				getData: () => Promise.resolve(true),
				observe: noop,
			});

			const loadstart = jest.fn();

			liveData.addEventListener('loadstart', loadstart);

			expect(loadstart).not.toHaveBeenCalled();
			liveData.observe();
			expect(loadstart).toHaveBeenCalledTimes(1);
		});

		test('a load event on load complete', async () => {
			const { promise, resolve } = Promise.withResolvers();

			const liveData = new LiveData({
				getData: () => {
					resolve(true);
					return Promise.resolve(true);
				},
				observe: noop,
			});

			const load = jest.fn();

			liveData.addEventListener('load', load);

			liveData.observe();

			expect(load).not.toHaveBeenCalled();
			await promise;
			expect(load).toHaveBeenCalledTimes(1);
		});

		test('an error event on load error', async () => {
			const { promise, resolve } = Promise.withResolvers();

			const liveData = new LiveData({
				getData: () => {
					resolve(true);
					return Promise.reject(new Error('Test rejection'));
				},
				observe: noop,
			});

			const error = jest.fn();

			liveData.addEventListener('error', error);

			liveData.observe();

			expect(error).not.toHaveBeenCalled();
			// Pass noop to prevent test failure due to error in promise
			await promise.catch(noop);
			expect(error).toHaveBeenCalledTimes(1);
		});

		describe('a loadend event on load end', () => {
			test('when load succeeds', async () => {
				const { promise, resolve } = Promise.withResolvers();

				const liveData = new LiveData({
					getData: () => {
						resolve(true);
						return Promise.resolve(true);
					},
					observe: noop,
				});

				const loadend = jest.fn();

				liveData.addEventListener('loadend', loadend);

				liveData.observe();

				expect(loadend).not.toHaveBeenCalled();
				await promise;
				expect(loadend).toHaveBeenCalledTimes(1);
			});

			test('when load fails', async () => {
				const { promise, resolve } = Promise.withResolvers();

				const liveData = new LiveData({
					getData: () => {
						resolve(true);
						return Promise.reject(new Error('Test rejection'));
					},
					observe: noop,
				});

				const loadend = jest.fn();

				liveData.addEventListener('loadend', loadend);

				liveData.observe();

				expect(loadend).not.toHaveBeenCalled();
				// Pass noop to prevent test failure due to error in promise
				await promise.catch(noop);
				expect(loadend).toHaveBeenCalledTimes(1);
			});
		});
	});

	test('when `observe` is called, calls `observe` function provided as an option', () => {
		const getData = () => Promise.resolve(true);
		const observe = jest.fn();

		const liveData = new LiveData({
			getData,
			observe,
		});

		expect(observe).not.toHaveBeenCalled();
		liveData.observe();
		expect(observe).toHaveBeenCalledTimes(1);
	});

	test('when the data is loaded, calls `observeState` function provided as an option', async () => {
		const {
			promise: loadPromise,
			resolve: loadResolve,
		} = Promise.withResolvers<void>();

		const getData = () => {
			loadResolve();
			return Promise.resolve(true);
		};
		const observe = noop;
		const observeState = jest.fn();

		const liveData = new LiveData({
			getData,
			observe,
			observeState,
		});

		expect(observeState).not.toHaveBeenCalled();
		liveData.observe();
		expect(observeState).not.toHaveBeenCalled();

		await loadPromise;
		expect(observeState).toHaveBeenCalled();
	});

	test('when data changes, aborts the `AbortSignal` passed to `observeState', async () => {
		let {
			promise: loadPromise,
			resolve: loadResolve,
		} = Promise.withResolvers<void>();
		const {
			promise: changePromise,
			resolve: changeResolve,
		} = Promise.withResolvers<void>();

		let value = true;
		const observeState = jest.fn((
			_getData,
			_data,
			abortSignal: AbortSignal,
		) => {
			if (unobserveStateSignal === null) {
				unobserveStateSignal = abortSignal;
			}
		});

		let unobserveStateSignal: AbortSignal | null = null;
		const liveData = new LiveData({
			getData: () => {
				loadResolve();
				return Promise.resolve(value);
			},
			observe: (getData) => {
				changePromise.then(() => getData());
			},
			observeState,
		});

		// Load data initially
		liveData.observe();
		expect(observeState).not.toHaveBeenCalled();

		// Allow data to load
		await loadPromise;

		// Set up next load trigger
		const loadResult = Promise.withResolvers<void>();
		loadPromise = loadResult.promise;
		loadResolve = loadResult.resolve;

		expect(observeState).toHaveBeenCalledTimes(1);
		expect(unobserveStateSignal!.aborted).toBe(false);

		// Trigger a data change detection
		value = false;
		changeResolve();
		await changePromise;

		expect(observeState).toHaveBeenCalledTimes(1);
		expect(unobserveStateSignal!.aborted).toBe(false);

		// Allow new data to load
		await loadPromise;

		expect(observeState).toHaveBeenCalledTimes(2);
		expect(unobserveStateSignal!.aborted).toBe(true);
	});

	test('runs `observeState` cleanup code when `unobserve` is called', async () => {
		const {
			promise: loadPromise,
			resolve: loadResolve,
		} = Promise.withResolvers<void>();

		const observeState = jest.fn((
			_getData,
			_data,
			abortSignal: AbortSignal,
		) => {
			if (unobserveStateSignal === null) {
				unobserveStateSignal = abortSignal;
			}
		});

		let unobserveStateSignal: AbortSignal | null = null;
		const liveData = new LiveData({
			getData: () => {
				loadResolve();
				return Promise.resolve(true);
			},
			observe: noop,
			observeState,
		});

		// Load data initially
		liveData.observe();
		expect(observeState).not.toHaveBeenCalled();

		// Allow data to load
		await loadPromise;

		expect(observeState).toHaveBeenCalledTimes(1);
		expect(unobserveStateSignal!.aborted).toBe(false);

		liveData.unobserve();

		expect(observeState).toHaveBeenCalledTimes(1);
		expect(unobserveStateSignal!.aborted).toBe(true);
	});

	describe('aborts the AbortSignal passed to `observe`', () => {
		test('when `unobserve` is called', () => {
			const abort = jest.fn();

			const liveData = new LiveData({
				getData: () => Promise.resolve(true),
				observe: (_getData, signal) => {
					signal.addEventListener('abort', abort);
				},
			});

			const loadend = jest.fn();

			liveData.addEventListener('loadend', loadend);

			liveData.observe();

			expect(abort).not.toHaveBeenCalled();
			liveData.unobserve();
			expect(abort).toHaveBeenCalledTimes(1);
		});

		test('when disposed', () => {
			const abort = jest.fn();

			const liveData = new LiveData({
				getData: () => Promise.resolve(true),
				observe: (_getData, signal) => {
					signal.addEventListener('abort', abort);
				},
			});

			const loadend = jest.fn();

			liveData.addEventListener('loadend', loadend);

			liveData.observe();

			expect(abort).not.toHaveBeenCalled();
			liveData[Symbol.dispose]();
			expect(abort).toHaveBeenCalledTimes(1);
		});
	});
});
