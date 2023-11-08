import type { KeyCombo, KeyboardShortcutInfo } from './types';
import { KeyboardShortcutName } from './types';

import { keyboardShortcutsRegister } from './keyboardShortcutsRegister';

export interface NewKeyboardShortcutRegisteredListener {
	(shortcutName: KeyboardShortcutInfo): void;
}

export const newKeyboardShortcutRegisteredListeners: Array<NewKeyboardShortcutRegisteredListener> = [];

/**
 * Register a keyboard shortcut, so listeners can be bound to it.
 *
 * A keyboard shortcut can be re-registered to override its shortcuts.
 */
export function registerKeyboardShortcut(name: KeyboardShortcutName, shortcuts: Array<KeyCombo>): KeyboardShortcutInfo {
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

	return info;
}
