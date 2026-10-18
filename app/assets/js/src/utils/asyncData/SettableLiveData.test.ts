import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { AsyncDataStateType } from './AsyncDataStateType';
import type { AsyncDataState } from './AsyncDataState';
import type { SettableAsyncDataState } from './SettableAsyncDataState';

import { SettableLiveData } from './SettableLiveData';

describe('SettableLiveData', () => {
	describe('provides optimistic data when optimistic option is set', () => {
		test('for object types', async () => {
			let data = {
				foo: 1,
				bar: 'a',
			};

			let {
				promise: loadPromise,
				resolve: loadResolve,
			} = Promise.withResolvers<void>();

			const {
				promise: setPromise,
				resolve: setResolve,
			} = Promise.withResolvers<void>();

			const settableLiveData = new SettableLiveData({
				optimistic: true,
				getData(_options) {
					loadResolve();
					return Promise.resolve(data);
				},
				observe(getData, _signal) {
					setPromise.then(() => getData());
				},
				setData(newData, _signal) {
					data = {
						...data,
						...newData,
					};
					setResolve();
					return Promise.resolve();
				},
			});

			settableLiveData.observe();

			// Check the initial load has started
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies AsyncDataState<typeof data>);

			await Promise.race([loadPromise]);

			const result = Promise.withResolvers<void>();
			loadPromise = result.promise;
			loadResolve = result.resolve;

			// Check the initial load has succeeded
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					foo: 1,
					bar: 'a',
				},
				loading: false,
			} satisfies AsyncDataState<typeof data>);

			// Set data and check optimistic state
			settableLiveData.setData({ foo: 2 });
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					foo: 2,
					bar: 'a',
				},
				loading: false,
			} satisfies AsyncDataState<typeof data>);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies SettableAsyncDataState);

			await Promise.race([setPromise]);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			});

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					foo: 2,
					bar: 'a',
				},
				loading: true,
			} satisfies AsyncDataState<typeof data>);

			// Check the reload succeeds and still displays the updated state
			await loadPromise;

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: {
					foo: 2,
					bar: 'a',
				},
				loading: false,
			} satisfies AsyncDataState<typeof data>);
		});
		test('for literal types', async () => {
			let data = 3;

			let {
				promise: loadPromise,
				resolve: loadResolve,
			} = Promise.withResolvers<void>();

			const {
				promise: setPromise,
				resolve: setResolve,
			} = Promise.withResolvers<void>();

			const settableLiveData = new SettableLiveData({
				optimistic: true,
				getData(_options) {
					loadResolve();
					return Promise.resolve(data);
				},
				observe(getData, _signal) {
					setPromise.then(() => getData());
				},
				setData(newData, _signal) {
					data = newData;
					setResolve();
					return Promise.resolve();
				},
			});

			settableLiveData.observe();

			// Check the initial load has started
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies AsyncDataState<typeof data>);

			await Promise.race([loadPromise]);

			const result = Promise.withResolvers<void>();
			loadPromise = result.promise;
			loadResolve = result.resolve;

			// Check the initial load has succeeded
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: 3,
				loading: false,
			} satisfies AsyncDataState<typeof data>);

			// Set data and check optimistic state
			settableLiveData.setData(4);
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: 4,
				loading: false,
			} satisfies AsyncDataState<typeof data>);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies SettableAsyncDataState);

			await Promise.race([setPromise]);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			});

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: 4,
				loading: true,
			} satisfies AsyncDataState<typeof data>);

			// Check the reload succeeds and still displays the updated state
			await loadPromise;

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: 4,
				loading: false,
			} satisfies AsyncDataState<typeof data>);
		});
	});

	test('reverts to previous data if set operation fails', async () => {
		const data = {
			foo: 1,
			bar: 'a',
		};

		const {
			promise: loadPromise,
			resolve: loadResolve,
		} = Promise.withResolvers<void>();

		const {
			promise: setPromise,
			resolve: setResolve,
		} = Promise.withResolvers<void>();

		const settableLiveData = new SettableLiveData({
			optimistic: true,
			getData(_options) {
				loadResolve();
				return Promise.resolve(data);
			},
			setData(_data, _signal) {
				setResolve();
				return Promise.reject(new Error('Test set error'));
			},
		});

		settableLiveData.observe();

		// Check the initial load has started
		expect(settableLiveData.getter.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<typeof data>);

		await Promise.race([loadPromise]);

		// Check the initial load has succeeded
		expect(settableLiveData.getter.state).toEqual({
			type: AsyncDataStateType.SUCCESS,
			data: {
				foo: 1,
				bar: 'a',
			},
			loading: false,
		} satisfies AsyncDataState<typeof data>);

		// Set data and check optimistic state reverts on error
		settableLiveData.setData({ foo: 2 });
		expect(settableLiveData.getter.state).toEqual({
			type: AsyncDataStateType.SUCCESS,
			data: {
				foo: 2,
				bar: 'a',
			},
			loading: false,
		} satisfies AsyncDataState<typeof data>);

		expect(settableLiveData.setter.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies SettableAsyncDataState);

		await Promise.race([setPromise]);

		expect(settableLiveData.setter.state).toEqual({
			type: AsyncDataStateType.ERROR,
			error: new Error('Test set error'),
			loading: false,
		});

		expect(settableLiveData.getter.state).toEqual({
			type: AsyncDataStateType.SUCCESS,
			data: {
				foo: 1,
				bar: 'a',
			},
			loading: false,
		} satisfies AsyncDataState<typeof data>);
	});
});
