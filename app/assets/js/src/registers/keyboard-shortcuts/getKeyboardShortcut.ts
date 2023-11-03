import type { KeyboardShortcutInfo } from './types';
import { KeyboardShortcutName } from './types';

import { keyboardShortcutsRegister } from './keyboardShortcutsRegister';

/**
 * Gets information about a specific keyboard shortcut.
 */
export function getKeyboardShortcut(name: KeyboardShortcutName): Readonly<KeyboardShortcutInfo> {
	const info = keyboardShortcutsRegister.get(name);

	if (!info) {
		throw new Error(`Cannot get info for unregistered keyboard shortcut ${name}`);
	}

	return info;
}
