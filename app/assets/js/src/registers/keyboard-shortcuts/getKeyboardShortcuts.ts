import { KeyboardShortcutInfo } from './types/index.js';

import { keyboardShortcutsRegister } from './keyboardShortcutsRegister.js';

/**
 * Get a list of information on all registered keyboard shortcuts.
 */
export function getKeyboardShortcuts(): ReadonlyArray<Readonly<KeyboardShortcutInfo>> {
	return Array.from(
		keyboardShortcutsRegister.values()
	).map((info) => ({ ...info }));
}
