import { KeyboardShortcutInfo, KeyboardShortcutName } from './types/index.js';

import { keyboardShortcutsRegister } from './keyboardShortcutsRegister.js';

export function getKeyboardShortcut(name: KeyboardShortcutName): Readonly<KeyboardShortcutInfo> {
	const info = keyboardShortcutsRegister.get(name);

	if (!info) {
		throw new Error(`Cannot get info for unregistered keyboard shortcut ${name}`);
	}

	return info;
}
