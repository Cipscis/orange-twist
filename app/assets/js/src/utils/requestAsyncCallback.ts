import type { DefaultsFor } from './DefaultsFor';

export interface RequestAsyncCallbackOptions {
	/**
	 * A number of milliseconds to treat as a deadline. If the callback has not been executed within this time, it may be prioritised at the cost of performance.
	 *
	 * @default 1500
	 */
	deadline?: number;
	/**
	 * A signal that can be used to abort the requested callback before it is called.
	 */
	signal?: AbortSignal;
}

const defaultOptions: DefaultsFor<Omit<RequestAsyncCallbackOptions, 'signal'>> = {
	deadline: 1500,
};

/**
 * Ask the browser to complete a task asynchronously before a deadline, preferably when the main thread is idle.
 * This can be used to improve performance, especially for callbacks that will be called many times in quick succession.
 *
 * @param callback The function to be called.
 * @param options An optional set of options to configure the request.
 *
 * @returns a `Promise` that resolves when the callback has been called, or rejects if it is aborted.
 */
export function requestAsyncCallback(callback: () => void, options?: RequestAsyncCallbackOptions): void {
	const {
		deadline,
		signal,
	} = {
		...defaultOptions,
		...options,
	};

	if (signal?.aborted) {
		// Don't queue a callback if the signal was already aborted
		return;
	}

	// As of 2025-02-07, Safari doesn't support requestIdleCallback
	// see [https://webkit.org/b/285049](Re-enable requestIdleCallback on Apple ports]
	if (window.requestIdleCallback) {
		const callbackId = window.requestIdleCallback(() => {
			callback();
		}, { timeout: deadline });
		if (signal) {
			signal.addEventListener('abort', () => {
				window.cancelIdleCallback(callbackId);
			});
		}
		return;
	}

	// As a fallback to requestIdleCallback, spread timeouts randomly across the deadline period
	// This allows multiple requested callbacks with the same deadline to be spread over that period
	const delay = Math.random() * deadline;
	const timeout = setTimeout(() => {
		callback();
	}, delay);
	if (signal) {
		signal.addEventListener('abort', () => {
			clearTimeout(timeout);
		});
	}
}
