import { NewCommandRegisteredListener, newCommandRegisteredListeners } from '../commandsRegister.js';

interface OnNewCommandRegisteredOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

/**
 * Bind a callback to fire whenever a new command is registered.
 */
export function onNewCommandRegistered(
	listener: NewCommandRegisteredListener,
	options?: OnNewCommandRegisteredOptions,
): void {
	if (options?.signal?.aborted) {
		return;
	}

	// Mimic `addEventListener` by not adding duplicate listeners
	if (newCommandRegisteredListeners.includes(listener)) {
		return;
	}

	newCommandRegisteredListeners.push(listener);

	options?.signal?.addEventListener(
		'abort',
		() => offNewCommandRegistered(listener),
	);
}

/**
 * Unbind a callback bound to new command registrations using {@linkcode onNewCommandRegistered}
 */
export function offNewCommandRegistered(listener: NewCommandRegisteredListener): void {
	const listenerIndex = newCommandRegisteredListeners.indexOf(listener);

	// If the listener exists, remove it
	if (listenerIndex !== -1) {
		newCommandRegisteredListeners.splice(listenerIndex, 1);
	}
}
