import {
	describe,
	expect,
	test,
} from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/preact';
import { useMemo } from 'preact/hooks';

import { AsyncDataStateType } from '../AsyncDataStateType';
import type { AsyncDataState } from '../AsyncDataState';

import {
	SettableLiveData,
	type SettableLiveDataOptions,
} from '../SettableLiveData';
import type { SettableAsyncDataState } from '../SettableAsyncDataState';

import { useSettableLiveData } from './useSettableLiveData';

describe('useSettableLiveData', () => {
	test('update states on load start and end', async () => {
		const { promise, resolve } = Promise.withResolvers<void>();

		let value = true;

		const initialProps: SettableLiveDataOptions<boolean> = {
			optimistic: true,
			getData(_options) {
				return Promise.resolve(value);
			},
			setData(data, _signal) {
				value = data;
				return Promise.resolve();
			},
			observe(getData, _signal) {
				promise.then(() => getData());
			},
		};

		const { rerender, result } = renderHook(
			(options) => {
				const settableLiveData = useMemo(() => {
					const settableLiveData = new SettableLiveData(options);
					settableLiveData.observe();
					return settableLiveData;
				}, [options]);

				return useSettableLiveData(settableLiveData);
			},
			{ initialProps },
		);

		// Check initial loading state
		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<boolean>);

		// Check initial loading success
		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		// Check initial save state
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		} satisfies SettableAsyncDataState);

		// Save data and check loading save state and optimistic loading state
		const savePromise = result.current.setData(false);
		rerender(initialProps);
		await waitFor(() => {
			expect(result.current.stateOfSet).toEqual({
				type: AsyncDataStateType.INITIAL,
				loading: true,
			} satisfies SettableAsyncDataState);
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: false,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		// Wait for save to complete and check save success
		await savePromise;
		await waitFor(() => {
			expect(result.current.stateOfSet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			} satisfies SettableAsyncDataState);
		});

		// Trigger reload and check reloading with optimistic data
		resolve();
		await promise;

		rerender(initialProps);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: false,
				loading: true,
			} satisfies AsyncDataState<boolean>);
		});

		// Check reload success
		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: false,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});
	});

	test('ensures SettableLiveData gets disposed on unmount', () => {
		let cleanupSignal: AbortSignal;

		const initialProps: SettableLiveDataOptions<boolean> = {
			getData(_options) {
				return Promise.resolve(true);
			},
			setData(_data, _signal) {
				// Do nothing
				return Promise.resolve();
			},
			observe(_getData, signal) {
				cleanupSignal = signal;
			},
		};

		const { result, unmount } = renderHook(
			(options) => {
				const settableLiveData = useMemo(() => {
					const settableLiveData = new SettableLiveData(options);
					settableLiveData.observe();
					return settableLiveData;
				}, [options]);

				return useSettableLiveData(settableLiveData);
			},
			{ initialProps },
		);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<boolean>);

		expect(cleanupSignal!.aborted).toBe(false);

		unmount();

		expect(cleanupSignal!.aborted).toBe(true);
	});

	test('constructs temporary hybrid state if a different SettableLiveData is passed in', async () => {
		const initialProps: SettableLiveDataOptions<boolean> = {
			getData(_options) {
				return Promise.resolve(true);
			},
			setData(_data, _signal) {
				// Do nothing
				return Promise.resolve();
			},
			observe() {},
		};

		const { rerender, result } = renderHook(
			(options) => {
				const settableLiveData = useMemo(() => {
					const settableLiveData = new SettableLiveData(options);
					settableLiveData.observe();
					return settableLiveData;
				}, [options]);

				return useSettableLiveData(settableLiveData);
			},
			{ initialProps },
		);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<boolean>);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		rerender({
			getData(_options) {
				return Promise.resolve(false);
			},
			setData(_data, _signal) {
				// Do nothing
				return Promise.resolve();
			},
			observe() {},
		});

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: true,
			} satisfies AsyncDataState<boolean>);
		});

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: false,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});
	});
});
