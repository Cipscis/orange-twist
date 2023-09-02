import { KeyboardShortcutName } from '../types/KeyboardShortcutName.js';
import { keyboardShortcutsRegister } from '../keyboardShortcutsRegister.js';

// Ensure keyboard shortcuts have been registered
import '../shortcuts/index.js';

/**
 * Bind a function to a keyboard shortcut, so it will be executed when the shortcut is used.
 *
 * @see {@link removeKeyboardShortcutListener} for unbinding listeners.
 * @see {@link useKeyboardShortcut} for using keyboard shortcuts in a Preact context.
 */
export function addKeyboardShortcutListener(name: KeyboardShortcutName, listener: () => void): void {
	const shortcutInfo = keyboardShortcutsRegister.get(name);

	if (!shortcutInfo) {
		throw new Error(`Cannot add listener to unregistered keyboard shortcut "${name}"`);
	}

	if (shortcutInfo.listeners.includes(listener)) {
		// Behave like `addEventListener` - don't bind the same listener twice
		return;
	}
	shortcutInfo.listeners.push(listener);
}

/**
 * Unbind a function from a keyboard shortcut that was bound via {@linkcode addKeyboardShortcutListener}
 */
export function removeKeyboardShortcutListener(name: KeyboardShortcutName, listener: () => void): void {
	const shortcutInfo = keyboardShortcutsRegister.get(name);

	if (!shortcutInfo) {
		throw new Error(`Cannot add listener to unregistered keyboard shortcut "${name}"`);
	}

	const listenerIndex = shortcutInfo.listeners.indexOf(listener);
	if (listenerIndex === -1) {
		// Behave like `removeEventListener` - fail silently if the listener wasn't bound already
		return;
	}
	shortcutInfo.listeners.splice(listenerIndex, 1);
}
