import {
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	act,
	renderHook,
} from '@testing-library/preact';

import {
	AsyncDataState,
	useAsyncData,
	type GetAsyncDataOptions,
} from './useAsyncData';

describe('useAsyncData', () => {
	test('returns an AsyncDataState', () => {
		const { result } = renderHook(
			() => useAsyncData(
				() => new Promise(() => {})
			)
		);

		expect(result.current).toMatchObject({
			state: AsyncDataState.LOADING,
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
			state: AsyncDataState.SUCCESS,
			data,
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
			state: AsyncDataState.LOADING,
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

		const error = new Error('Failed to fetch');
		await act(() => rejectWithError!(error));
		// TODO: Can I refactor it to not need an additional rerender?
		await act(() => rerender(initialProps));

		expect(result.current).toMatchObject({
			state: AsyncDataState.ERROR,
			error,
		});
	});
});
