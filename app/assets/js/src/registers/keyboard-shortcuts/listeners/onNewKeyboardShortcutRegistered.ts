import type { NewKeyboardShortcutRegisteredListener } from '../registerKeyboardShortcut';
import { newKeyboardShortcutRegisteredListeners } from '../registerKeyboardShortcut';

interface OnNewKeyboardShortcutRegisteredOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

/**
 * Bind a callback to fire whenever a new keyboard shortcut is registered.
 *
 * @see {@linkcode offNewKeyboardShortcutRegistered} for removing this binding.
 */
export function onNewKeyboardShortcutRegistered(
	listener: NewKeyboardShortcutRegisteredListener,
	options?: OnNewKeyboardShortcutRegisteredOptions,
): void {
	if (options?.signal?.aborted) {
		return;
	}

	// Mimic `addEventListener` by not adding duplicate listeners
	if (newKeyboardShortcutRegisteredListeners.includes(listener)) {
		return;
	}

	newKeyboardShortcutRegisteredListeners.push(listener);

	if (options?.signal) {
		options.signal.addEventListener(
			'abort',
			() => offNewKeyboardShortcutRegistered(listener),
		);
	}
}

/**
 * Unbind a callback bound to new keyboard shortcut registrations using {@linkcode onNewKeyboardShortcutRegistered}
 */
export function offNewKeyboardShortcutRegistered(listener: NewKeyboardShortcutRegisteredListener): void {
	const listenerIndex = newKeyboardShortcutRegisteredListeners.indexOf(listener);

	// If the listener exists, remove it
	if (listenerIndex !== -1) {
		newKeyboardShortcutRegisteredListeners.splice(listenerIndex, 1);
	}
}
