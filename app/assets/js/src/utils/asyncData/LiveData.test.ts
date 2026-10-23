import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { AsyncDataStateType } from './AsyncDataStateType';
import type { AsyncDataState } from './AsyncDataState';

import { LiveData } from './LiveData';

describe('LiveData', () => {
	test('triggers getting the data when `observe` is called', async () => {
		const { promise, resolve } = Promise.withResolvers();

		const getData = jest.fn(() => {
			resolve(true);
			return Promise.resolve(true);
		});

		const liveData = new LiveData({
			getData,
		});

		expect(getData).not.toHaveBeenCalled();
		liveData.observe();
		expect(getData).toHaveBeenCalledTimes(1);

		expect(liveData.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<boolean>);

		// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
		await Promise.race([promise]);

		expect(liveData.state).toEqual({
			type: AsyncDataStateType.SUCCESS,
			data: true,
			loading: false,
		} satisfies AsyncDataState<boolean>);
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
		const observeState = jest.fn();

		const liveData = new LiveData({
			getData,
			observeState,
		});

		expect(observeState).not.toHaveBeenCalled();
		liveData.observe();
		expect(observeState).not.toHaveBeenCalled();

		// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
		await Promise.race([loadPromise]);
		await Promise.resolve();
		expect(observeState).toHaveBeenCalled();
	});

	test('when data changes, aborts the `AbortSignal` passed to `observeState`', async () => {
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
		// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
		await Promise.race([loadPromise]);
		await Promise.resolve();

		// Set up next load trigger
		const loadResult = Promise.withResolvers<void>();
		loadPromise = loadResult.promise;
		loadResolve = loadResult.resolve;

		expect(observeState).toHaveBeenCalledTimes(1);
		expect(unobserveStateSignal!.aborted).toBe(false);

		// Trigger a data change detection
		value = false;
		changeResolve();
		// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
		await Promise.race([changePromise]);
		await Promise.resolve();

		expect(observeState).toHaveBeenCalledTimes(1);
		expect(unobserveStateSignal!.aborted).toBe(false);

		// Allow new data to load
		// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
		await Promise.race([loadPromise]);

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
			observeState,
		});

		// Load data initially
		liveData.observe();
		expect(observeState).not.toHaveBeenCalled();

		// Allow data to load
		// Use Promise.race to mirror internal use (involves two microtask queues to resolve)
		await Promise.race([loadPromise]);
		await Promise.resolve();

		expect(observeState).toHaveBeenCalledTimes(1);
		expect(unobserveStateSignal!.aborted).toBe(false);

		liveData.unobserve();

		expect(observeState).toHaveBeenCalledTimes(1);
		expect(unobserveStateSignal!.aborted).toBe(true);
	});

	describe('aborts the AbortSignal passed to `getData` when `unobserve` is called while getting data', () => {
		test('for the initial `getData` call', () => {
			let abortSignal: AbortSignal | null = null;

			const liveData = new LiveData({
				getData(options) {
					abortSignal = options.signal;
					return Promise.resolve(true);
				},
			});

			liveData.observe();

			expect(abortSignal!.aborted).toBe(false);
			liveData.unobserve();
			expect(abortSignal!.aborted).toBe(true);
		});

		test('for a `getData` call from within `observe`', async () => {
			let initialCall = true;
			let abortSignal: AbortSignal | null = null;
			const {
				promise: initialLoadPromise,
				resolve: initialLoadResolve,
			} = Promise.withResolvers<void>();
			const {
				promise: reloadPromise,
				resolve: reloadResolve,
			} = Promise.withResolvers<void>();

			const liveData = new LiveData({
				getData(options) {
					if (initialCall) {
						initialCall = false;
					} else {
						abortSignal = options.signal;
					}
					initialLoadResolve();
					return Promise.resolve(true);
				},
				observe(getData, signal) {
					reloadPromise.then(() => getData());
				},
			});

			liveData.observe();

			// Wait for inital load
			await Promise.race([initialLoadPromise]);

			// Trigger reload
			reloadResolve();
			await Promise.resolve();

			// Process microtask queue to ensure getData is called
			await Promise.resolve();

			expect(abortSignal!.aborted).toBe(false);
			liveData.unobserve();
			expect(abortSignal!.aborted).toBe(true);
		});

		test('for a `getData` call from within `observeState`', async () => {
			let initialCall = true;
			let abortSignal: AbortSignal | null = null;
			const {
				promise: initialLoadPromise,
				resolve: initialLoadResolve,
			} = Promise.withResolvers<void>();
			const {
				promise: reloadPromise,
				resolve: reloadResolve,
			} = Promise.withResolvers<void>();

			const liveData = new LiveData({
				getData(options) {
					if (initialCall) {
						initialCall = false;
					} else {
						abortSignal = options.signal;
					}
					initialLoadResolve();
					return Promise.resolve(true);
				},
				observeState(getData, state, signal) {
					reloadPromise.then(() => getData());
				},
			});

			liveData.observe();

			// Wait for inital load
			await Promise.race([initialLoadPromise]);
			await Promise.resolve();

			// Trigger reload
			reloadResolve();
			await reloadPromise;

			// Process microtask queue to ensure getData is called
			await Promise.resolve();

			expect(abortSignal!.aborted).toBe(false);
			liveData.unobserve();
			expect(abortSignal!.aborted).toBe(true);
		});
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
