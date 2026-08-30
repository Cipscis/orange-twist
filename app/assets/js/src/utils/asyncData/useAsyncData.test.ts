import {
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	act,
	renderHook,
} from '@testing-library/preact';

import { AsyncDataStateType } from './AsyncDataStateType';
import {
	useAsyncData,
	type GetAsyncDataOptions,
} from './useAsyncData';

describe('useAsyncData', () => {
	test('starts in an initial state', () => {
		const { result } = renderHook(
			() => useAsyncData(
				() => new Promise(() => {})
			)
		);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
	});

	test('enters loading state when data is requested', () => {
		const initialProps = {
			getData: () => new Promise(() => {}),
		};
		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps },
		);

		result.current.getData();
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
	});

	test('retains state and any metadata when loading', async () => {
		const initialProps = {
			getData: () => Promise.resolve(true),
		};
		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps },
		);

		await result.current.getData();
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: true,
		});

		result.current.getData();
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: true,
			data: true,
		});
	});

	test('makes data available when Promise is settled', async () => {
		const {
			resolve: resolveData,
			promise: dataPromise,
		} = Promise.withResolvers<unknown>();
		const initialProps = {
			getData: () => dataPromise,
		};

		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		const data = Math.random();

		result.current.getData();
		rerender(initialProps);
		expect(result.current.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});

		await act(() => resolveData(data));
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data,
		});
	});

	test('resolves with error when Promise is rejected', async () => {
		const {
			reject: rejectWithError,
			promise: dataPromise,
		} = Promise.withResolvers<never>();
		const initialProps = {
			getData: () => dataPromise,
		};

		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		result.current.getData()
			.catch(() => {
				// Do nothing on error, but consider it handled
			});

		const error = new Error('Failed to fetch');
		await act(() => rejectWithError(error));
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.ERROR,
			loading: false,
			error,
		});
	});

	test('aborts any previous attempts when starting a new one', () => {
		let abortSignal: AbortSignal;
		const initialProps = {
			getData: (options?: GetAsyncDataOptions) => new Promise(() => {
				abortSignal = abortSignal ?? options!.signal;
			}),
		};
		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		result.current.getData();
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
		expect(abortSignal!.aborted).toBe(false);

		result.current.getData();
		rerender(initialProps);

		expect(abortSignal!.aborted).toBe(true);
	});

	test('enters aborted state if aborted before reaching success or error states', () => {
		const {
			promise,
		} = Promise.withResolvers();
		const initialProps = {
			getData: () => promise,
		};
		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		const abortController = new AbortController();
		const { signal } = abortController;

		result.current.getData({ signal });
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});

		abortController.abort('Manually aborted');
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.ABORTED,
			loading: false,
			reason: 'Manually aborted',
		});
	});

	test('does not enter aborted state if aborted after reaching success state', async () => {
		const {
			promise,
			resolve,
		} = Promise.withResolvers();
		const initialProps = {
			getData: () => promise,
		};
		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		const abortController = new AbortController();
		const { signal } = abortController;

		result.current.getData({ signal });
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});

		await act(() => resolve('Data'));

		abortController.abort('Manually aborted');
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.SUCCESS,
			data: 'Data',
			loading: false,
		});
	});

	test('does not enter aborted state if aborted after reaching error state', async () => {
		const {
			promise,
			reject,
		} = Promise.withResolvers();
		const initialProps = {
			getData: () => promise,
		};
		const { result, rerender } = renderHook(
			({ getData }) => useAsyncData(getData),
			{ initialProps }
		);

		const abortController = new AbortController();
		const { signal } = abortController;

		result.current.getData({ signal })
			.catch(() => {
				// Do nothing on error
			});
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});

		const error = new Error('Error');
		await act(() => reject(error));

		abortController.abort('Manually aborted');
		rerender(initialProps);

		expect(result.current.state).toEqual({
			type: AsyncDataStateType.ERROR,
			loading: false,
			error,
		});
	});
});
