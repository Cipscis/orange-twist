import type { KeyboardShortcutInfo } from './types';

import { keyboardShortcutsRegister } from './keyboardShortcutsRegister';

/**
 * Get a list of information on all registered keyboard shortcuts.
 */
export function getKeyboardShortcuts(): ReadonlyArray<Readonly<KeyboardShortcutInfo>> {
	return Array.from(
		keyboardShortcutsRegister.values()
	).map((info) => ({ ...info }));
}
