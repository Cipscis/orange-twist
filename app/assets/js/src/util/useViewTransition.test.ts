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

import { useViewTransition } from './useViewTransition.js';

describe('useViewTransition', () => {
	test('returns a ViewTransitionState', () => {
		const { result } = renderHook(
			() => useViewTransition()
		);

		expect(typeof result.current.startViewTransition).toBe('function');
		expect(result.current.isInViewTransition).toBe(false);
	});

	test('puts us through a view transition when calling startViewTransition', async () => {
		const { result, rerender } = renderHook(
			() => useViewTransition()
		);

		expect(result.current.isInViewTransition).toBe(false);

		// At time of writing, jsdom hasn't  implemented document.startViewTransition
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
});
