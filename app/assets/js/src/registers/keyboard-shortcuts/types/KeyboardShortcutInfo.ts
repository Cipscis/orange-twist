import type { KeyCombo } from './KeyCombo';
import type { KeyboardShortcutName } from './KeyboardShortcutName';

export interface KeyboardShortcutInfo {
	name: KeyboardShortcutName;
	/**
	 * One or more key combos that can be used to fire this keyboard shortcut.
	 */
	shortcuts: Array<KeyCombo>;
	listeners: Array<() => void>;
}
