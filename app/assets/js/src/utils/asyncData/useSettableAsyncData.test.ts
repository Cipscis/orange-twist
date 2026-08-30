import {
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	renderHook,
} from '@testing-library/preact';

import { AsyncDataStateType } from './AsyncDataStateType';
import { useSettableAsyncData } from './useSettableAsyncData';

describe('useSettableAsyncData', () => {
	test('provides a settable async data state', () => {
		const { result } = renderHook(
			() => useSettableAsyncData({
				getData: () => Promise.resolve({ foo: true }),
				setData: () => Promise.resolve(),
			})
		);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
	});

	test('allows data to be set', async () => {
		let data = { foo: false };
		const initialProps = {
			getData: () => Promise.resolve(data),
			setData: (value: Partial<{ foo: boolean; }>) => new Promise<void>((resolve) => {
				queueMicrotask(() => {
					data = {
						...data,
						...value,
					};
					resolve();
				});
			}),
		};

		const { rerender, result } = renderHook(
			(initialProps) => useSettableAsyncData(initialProps),
			{ initialProps }
		);

		const setPromise = result.current.setData({ foo: true });

		rerender(initialProps);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});

		await setPromise;

		rerender(initialProps);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
		});
	});

	test('handles errors on setting data', async () => {
		const initialProps = {
			getData: () => Promise.resolve({ foo: true }),
			setData: () => Promise.reject(new Error('Error message')),
		};

		const { rerender, result } = renderHook(
			(initialProps) => useSettableAsyncData(initialProps),
			{ initialProps }
		);

		await result.current.setData({foo: true });
		rerender(initialProps);

		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.ERROR,
			error: new Error('Error message'),
			loading: false,
		});
	});

	test('provides previous data when optimistic option is unset', async () => {
		let data = { foo: false };
		const initialProps = {
			getData: () => Promise.resolve(data),
			setData: (value: Partial<{ foo: boolean; }>) => new Promise<void>((resolve) => {
				queueMicrotask(() => {
					data = {
						...data,
						...value,
					};
					resolve();
				});
			}),
		};

		const { rerender, result } = renderHook(
			(initialProps) => useSettableAsyncData(initialProps),
			{ initialProps }
		);

		await result.current.getData();
		rerender(initialProps);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: { foo: false },
		});

		const setPromise = result.current.setData({ foo: true });

		rerender(initialProps);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: { foo: false },
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});

		await setPromise;
		rerender(initialProps);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: { foo: false },
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
		});
	});

	test('provides next data when optimistic option is set', async () => {
		let data = { foo: false };
		const initialProps = {
			getData: () => Promise.resolve(data),
			setData: (value: Partial<{ foo: boolean; }>) => new Promise<void>((resolve) => {
				queueMicrotask(() => {
					data = {
						...data,
						...value,
					};
					resolve();
				});
			}),
			optimistic: true,
		};

		const { rerender, result } = renderHook(
			(initialProps) => useSettableAsyncData(initialProps),
			{ initialProps }
		);

		await result.current.getData();
		rerender(initialProps);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: { foo: false },
		});

		const setPromise = result.current.setData({ foo: true });
		rerender(initialProps);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: { foo: true },
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});

		await setPromise;
		rerender(initialProps);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: { foo: true },
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
		});
	});
});
