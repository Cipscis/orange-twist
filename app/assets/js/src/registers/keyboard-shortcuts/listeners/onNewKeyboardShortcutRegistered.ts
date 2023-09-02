import { NewKeyboardShortcutRegisteredListener, newKeyboardShortcutRegisteredListeners } from '../keyboardShortcutsRegister.js';

/**
 * Bind a callback to fire whenever a new keyboard shortcut is registered.
 */
export function onNewKeyboardShortcutRegistered(listener: NewKeyboardShortcutRegisteredListener): void {
	// Mimic `addEventListener` by not adding duplicate listeners
	if (newKeyboardShortcutRegisteredListeners.includes(listener)) {
		return;
	}

	newKeyboardShortcutRegisteredListeners.push(listener);
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
