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
	LiveData,
	type LiveDataOptions,
} from '../LiveData';

import { useLiveData } from './useLiveData';

describe('useLiveData', () => {
	test('updates state on load start and end', async () => {
		const { promise, resolve } = Promise.withResolvers<void>();

		let value = true;

		const initialProps: LiveDataOptions<boolean> = {
			getData(_options) {
				return Promise.resolve(value);
			},
			observe(getData, _signal) {
				promise.then(() => getData());
			},
		};

		const { rerender, result } = renderHook(
			(options) => {
				const liveData = useMemo(() => {
					const liveData = new LiveData(options);
					liveData.observe();
					return liveData;
				}, [options]);

				return useLiveData(liveData);
			},
			{ initialProps },
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<boolean>);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		value = false;

		resolve();
		await promise;

		rerender(initialProps);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: true,
			} satisfies AsyncDataState<boolean>);
		});

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: false,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});
	});

	test('ensures liveData gets unobserved on unmount', () => {
		let cleanupSignal: AbortSignal;

		const initialProps: LiveDataOptions<boolean> = {
			getData(_options) {
				return Promise.resolve(true);
			},
			observe(_getData, signal) {
				cleanupSignal = signal;
			},
		};

		const { result, unmount } = renderHook(
			(options) => {
				const liveData = useMemo(() => {
					const liveData = new LiveData(options);
					liveData.observe();
					return liveData;
				}, [options]);

				return useLiveData(liveData);
			},
			{ initialProps },
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<boolean>);

		expect(cleanupSignal!.aborted).toBe(false);

		unmount();

		expect(cleanupSignal!.aborted).toBe(true);
	});

	test('constructs temporary hybrid state if a different LiveData is passed in', async () => {
		const initialProps: LiveDataOptions<boolean> = {
			getData(_options) {
				return Promise.resolve(true);
			},
			observe() {},
		};

		const { rerender, result } = renderHook(
			(options) => {
				const liveData = useMemo(() => {
					const liveData = new LiveData(options);
					liveData.observe();
					return liveData;
				}, [options]);

				return useLiveData(liveData);
			},
			{ initialProps },
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<boolean>);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});

		rerender({
			getData(_options) {
				return Promise.resolve(false);
			},
			observe() {},
		});

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: true,
				loading: true,
			} satisfies AsyncDataState<boolean>);
		});

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				data: false,
				loading: false,
			} satisfies AsyncDataState<boolean>);
		});
	});
});
