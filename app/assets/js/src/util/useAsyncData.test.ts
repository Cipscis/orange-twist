import {
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	act,
	renderHook,
} from '@testing-library/preact';

import { GetAsyncDataOptions, useAsyncData } from './useAsyncData.js';

describe('useAsyncData', () => {
	test('returns an AsyncDataState', () => {
		const { result } = renderHook(
			() => useAsyncData(
				() => new Promise(() => {})
			)
		);

		expect(result.current).toMatchObject({
			data: null,
			isLoading: true,
			error: null,
		});
	});

	test('makes data available when Promise is settled', async () => {
		let resolveData: (value: unknown) => void;
		const dataPromise = new Promise((resolve) => resolveData = resolve);
		const initialProps = {
			getData: () => dataPromise,
		};

		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		const data = Math.random();
		await act(() => resolveData!(data));
		// TODO: Can I refactor it to not need an additional rerender?
		await act(() => rerender(initialProps));

		expect(result.current).toMatchObject({
			data,
			isLoading: false,
			error: null,
		});
	});

	test('passes an AbortSignal to get callback, and aborts it if unmounted', () => {
		let abortSignal: AbortSignal | undefined;
		const initialProps = {
			getData: (options?: GetAsyncDataOptions) => new Promise(() => {
				abortSignal = options?.signal;
			}),
		};

		const { result, unmount } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		expect(result.current).toMatchObject({
			data: null,
			isLoading: true,
			error: null,
		});
		expect(abortSignal!.aborted).toBe(false);

		unmount();

		expect(abortSignal!.aborted).toBe(true);
	});

	test('resolves with error when Promise is rejected', async () => {
		let rejectWithError: (value: unknown) => void;
		const dataPromise = new Promise((resolve, reject) => rejectWithError = reject);
		const initialProps = {
			getData: () => dataPromise,
		};

		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		const errorMessage = 'Failed to fetch';
		await act(() => rejectWithError!(new Error(errorMessage)));
		// TODO: Can I refactor it to not need an additional rerender?
		await act(() => rerender(initialProps));

		expect(result.current).toMatchObject({
			data: null,
			isLoading: false,
			error: errorMessage,
		});
	});
});
