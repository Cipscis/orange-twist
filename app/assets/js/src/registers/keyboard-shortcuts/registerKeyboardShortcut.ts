import { KeyCombo, KeyboardShortcutName } from './types/index.js';

import { keyboardShortcutsRegister, newKeyboardShortcutRegisteredListeners } from './keyboardShortcutsRegister.js';

/**
 * Register a keyboard shortcut, so listeners can be bound to it.
 *
 * A keyboard shortcut can be re-registered to override its shortcuts.
 */
export function registerKeyboardShortcut(name: KeyboardShortcutName, shortcuts: Array<KeyCombo>): void {
	const listeners = keyboardShortcutsRegister.get(name)?.listeners ?? [];

	const info = {
		name,
		shortcuts,
		listeners,
	};
	keyboardShortcutsRegister.set(name, info);

	for (const listener of newKeyboardShortcutRegisteredListeners) {
		listener(info);
	}
}
