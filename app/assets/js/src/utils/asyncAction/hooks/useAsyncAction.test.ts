import {
	describe,
	expect,
	test,
} from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/preact';
import { useMemo } from 'preact/hooks';

import { AsyncActionStateType } from '../AsyncActionStateType';
import type { AsyncActionState } from '../AsyncActionState';

import { LiveData } from '../LiveData';

import { useAsyncAction } from './useAsyncAction';

describe('useAsyncAction', () => {
	test('updates state on load start and end', async () => {
		const { promise, resolve } = Promise.withResolvers<void>();

		let value = true;

		const initialProps: ConstructorParameters<
			typeof LiveData<boolean>
		> = [
			(_options) => {
				return Promise.resolve(value);
			},
			{
				observe(getData) {
					promise.then(() => getData());
				},
			},
		];

		const { rerender, result } = renderHook(
			([fn, options]) => {
				const liveData = useMemo(() => {
					const liveData = new LiveData(fn, options);
					liveData.observe();
					return liveData;
				}, [fn, options]);

				return useAsyncAction(liveData);
			},
			{ initialProps },
		);

		expect(result.current).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
			progress: null,
		} satisfies AsyncActionState<boolean>);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<boolean>);
		});

		value = false;

		resolve();
		await promise;

		// Process microtask queue to ensure getData is called
		await Promise.resolve();

		rerender(initialProps);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: true,
				progress: null,
			} satisfies AsyncActionState<boolean>);
		});

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: false,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<boolean>);
		});
	});

	test('ensures cleanup is done on unmount', () => {
		let cleanupSignal: AbortSignal;

		const initialProps: ConstructorParameters<
			typeof LiveData<boolean>
		> = [
			(_options) => {
				return Promise.resolve(true);
			},
			{
				observe(_getData, signal) {
					cleanupSignal = signal;
				},
			},
		];

		const { result, unmount } = renderHook(
			([fn, options]) => {
				const liveData = useMemo(() => {
					const liveData = new LiveData(fn, options);
					liveData.observe();
					return liveData;
				}, [fn, options]);

				return useAsyncAction(liveData);
			},
			{ initialProps },
		);

		expect(result.current).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
			progress: null,
		} satisfies AsyncActionState<boolean>);

		expect(cleanupSignal!.aborted).toBe(false);

		unmount();

		expect(cleanupSignal!.aborted).toBe(true);
	});

	test('constructs temporary hybrid state if a different LiveData is passed in', async () => {
		const initialProps: ConstructorParameters<
			typeof LiveData<boolean>
		> = [
			(_options) => {
				return Promise.resolve(true);
			},
			{
				observe() {},
			},
		];

		const { rerender, result } = renderHook(
			([fn, options]) => {
				const liveData = useMemo(() => {
					const liveData = new LiveData(fn, options);
					liveData.observe();
					return liveData;
				}, [fn, options]);

				return useAsyncAction(liveData);
			},
			{ initialProps },
		);

		expect(result.current).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
			progress: null,
		} satisfies AsyncActionState<boolean>);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<boolean>);
		});

		rerender([
			() => {
				return Promise.resolve(false);
			},
			{
				observe() {},
			},
		]);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: true,
				loading: true,
				progress: null,
			} satisfies AsyncActionState<boolean>);
		});

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: false,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<boolean>);
		});
	});
});
