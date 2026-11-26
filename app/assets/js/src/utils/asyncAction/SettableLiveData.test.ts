import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { AsyncActionStateType } from './AsyncActionStateType';
import type { AsyncActionState } from './AsyncActionState';

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
				setData(_options, newData) {
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
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<typeof data>);

			await Promise.race([loadPromise]);
			await Promise.resolve();

			const result = Promise.withResolvers<void>();
			loadPromise = result.promise;
			loadResolve = result.resolve;

			// Check the initial load has succeeded
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: {
					foo: 1,
					bar: 'a',
				},
				loading: false,
			} satisfies AsyncActionState<typeof data>);

			// Set data and check optimistic state
			settableLiveData.setData({ foo: 2 });

			// Process microtask queue to ensure getData is called
			await Promise.resolve();

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: {
					foo: 2,
					bar: 'a',
				},
				loading: false,
			} satisfies AsyncActionState<typeof data>);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<void>);

			await Promise.race([setPromise]);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				loading: false,
			});

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: {
					foo: 2,
					bar: 'a',
				},
				loading: true,
			} satisfies AsyncActionState<typeof data>);

			// Check the reload succeeds and still displays the updated state
			await loadPromise;

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: {
					foo: 2,
					bar: 'a',
				},
				loading: false,
			} satisfies AsyncActionState<typeof data>);
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
				setData(_options, newData) {
					data = newData;
					setResolve();
					return Promise.resolve();
				},
			});

			settableLiveData.observe();

			// Check the initial load has started
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<typeof data>);

			await Promise.race([loadPromise]);
			await Promise.resolve();

			const result = Promise.withResolvers<void>();
			loadPromise = result.promise;
			loadResolve = result.resolve;

			// Check the initial load has succeeded
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 3,
				loading: false,
			} satisfies AsyncActionState<typeof data>);

			// Set data and check optimistic state
			settableLiveData.setData(4);

			// Process microtask queue to ensure getData is called
			await Promise.resolve();

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 4,
				loading: false,
			} satisfies AsyncActionState<typeof data>);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<void>);

			await Promise.race([setPromise]);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				loading: false,
			});

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 4,
				loading: true,
			} satisfies AsyncActionState<typeof data>);

			// Check the reload succeeds and still displays the updated state
			await loadPromise;

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: 4,
				loading: false,
			} satisfies AsyncActionState<typeof data>);
		});
		test('for array types', async () => {
			let data = [1, 2, 3];

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
				setData(_options, newData) {
					data = Array.from(newData);
					setResolve();
					return Promise.resolve();
				},
			});

			settableLiveData.observe();

			// Check the initial load has started
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<typeof data>);

			await Promise.race([loadPromise]);
			await Promise.resolve();

			const result = Promise.withResolvers<void>();
			loadPromise = result.promise;
			loadResolve = result.resolve;

			// Check the initial load has succeeded
			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: [1, 2, 3],
				loading: false,
			} satisfies AsyncActionState<typeof data>);

			// Set data and check optimistic state
			settableLiveData.setData([1, 4, 3, 2]);

			// Process microtask queue to ensure getData is called
			await Promise.resolve();

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: [1, 4, 3, 2],
				loading: false,
			} satisfies AsyncActionState<typeof data>);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncActionStateType.INITIAL,
				loading: true,
			} satisfies AsyncActionState<void>);

			await Promise.race([setPromise]);

			expect(settableLiveData.setter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				loading: false,
			});

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: [1, 4, 3, 2],
				loading: true,
			} satisfies AsyncActionState<typeof data>);

			// Check the reload succeeds and still displays the updated state
			await loadPromise;

			expect(settableLiveData.getter.state).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: [1, 4, 3, 2],
				loading: false,
			} satisfies AsyncActionState<typeof data>);
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
			setData(_options, _data) {
				setResolve();
				return Promise.reject(new Error('Test set error'));
			},
		});

		settableLiveData.observe();

		// Check the initial load has started
		expect(settableLiveData.getter.state).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
		} satisfies AsyncActionState<typeof data>);

		await Promise.race([loadPromise]);

		// Check the initial load has succeeded
		expect(settableLiveData.getter.state).toEqual({
			type: AsyncActionStateType.SUCCESS,
			data: {
				foo: 1,
				bar: 'a',
			},
			loading: false,
		} satisfies AsyncActionState<typeof data>);

		// Set data and check optimistic state reverts on error
		settableLiveData.setData({ foo: 2 });

		expect(settableLiveData.getter.state).toEqual({
			type: AsyncActionStateType.SUCCESS,
			data: {
				foo: 2,
				bar: 'a',
			},
			loading: false,
		} satisfies AsyncActionState<typeof data>);

		expect(settableLiveData.setter.state).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
		} satisfies AsyncActionState<void>);

		await Promise.race([setPromise]);

		expect(settableLiveData.setter.state).toEqual({
			type: AsyncActionStateType.ERROR,
			error: new Error('Test set error'),
			loading: false,
		});

		expect(settableLiveData.getter.state).toEqual({
			type: AsyncActionStateType.SUCCESS,
			data: {
				foo: 1,
				bar: 'a',
			},
			loading: false,
		} satisfies AsyncActionState<typeof data>);
	});
});
