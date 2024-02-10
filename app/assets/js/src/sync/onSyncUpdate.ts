// Type-only import to expose symbol to JSDoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { syncUpdate } from './syncUpdate';
import { syncCallbacks } from './channel';

interface OnSyncUpdateOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

/**
 * Binds a callback function to fire whenever {@linkcode syncUpdate} is
 * called in another context.
 *
 * @param listener A function to be called whenever {@linkcode syncUpdate}
 * is called in another context.
 * @param [options] An object containing options.
 *
 * @see {@linkcode offSyncUpdate} for removing listeners.
 */
export function onSyncUpdate(
	listener: () => void,
	options?: OnSyncUpdateOptions,
): void {
	// Do nothing if passed an aborted signal
	if (options?.signal?.aborted) {
		return;
	}

	syncCallbacks.add(listener);

	if (options?.signal) {
		options.signal.addEventListener(
			'abort',
			() => offSyncUpdate(listener)
		);
	}
}

/**
 * Unbinds a callback function that was bound to sync updates
 * with {@linkcode onSyncUpdate}.
 *
 * @param listener A function to be called whenever {@linkcode syncUpdate}
 * is called in another context.
 */

export function offSyncUpdate(
	callback: () => void
): void {
	syncCallbacks.delete(callback);
}
