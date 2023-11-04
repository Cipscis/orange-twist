import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import {
	act,
	renderHook,
} from '@testing-library/preact';

import { useViewTransition } from './useViewTransition';
import { afterEach } from 'node:test';

const defaultStartViewTransition = document.startViewTransition;

describe('useViewTransition', () => {
	afterEach(() => {
		document.startViewTransition = defaultStartViewTransition;
	});

	test('returns a ViewTransitionState', () => {
		const { result } = renderHook(
			() => useViewTransition()
		);

		expect(typeof result.current.startViewTransition).toBe('function');
		expect(result.current.isInViewTransition).toBe(false);
	});

	test('if the View Transitions API is supported, puts us through a view transition when calling startViewTransition', async () => {
		const { result, rerender } = renderHook(
			() => useViewTransition()
		);

		expect(result.current.isInViewTransition).toBe(false);

		// Mock document.startViewTransition so we can control when it's finished
		let finished: (value: unknown) => void;

		Object.defineProperty(document, 'startViewTransition', {
			writable: true,
			configurable: true,
			value: jest.fn((callback: () => void) => {
				callback();

				return {
					finished: new Promise((resolve) => finished = resolve),
					ready: new Promise(() => {}),
					updateCallbackDone: new Promise(() => {}),

					skipTransition: () => {},
				};
			}),
		});

		// Calling startViewTransition puts us in a view transition
		const spy = jest.fn();
		await act(() => {
			result.current.startViewTransition(spy);
		});

		await act(() => rerender());

		expect(result.current.isInViewTransition).toBe(true);
		// The DOM update callback gets called
		expect(spy).toHaveBeenCalled();

		// Once the view transition is finished, we leave the view transition state
		await act(() => {
			finished(null);
		});
		await act(() => {
			rerender();
		});

		expect(result.current.isInViewTransition).toBe(false);
	});

	test('if the View Transitions API is not supported, calls the callback immediately', async () => {
		// Ensure the View Transitions API is not supported
		document.startViewTransition = undefined;

		const { result, rerender } = renderHook(
			() => useViewTransition()
		);

		expect(result.current.isInViewTransition).toBe(false);

		// Calling startViewTransition executes the callback
		const spy = jest.fn();
		await act(() => {
			result.current.startViewTransition(spy);
		});

		expect(spy).toHaveBeenCalled();

		await act(() => rerender());

		// We never enter this state if the View Transitions API is not supported
		expect(result.current.isInViewTransition).toBe(false);
	});
});
