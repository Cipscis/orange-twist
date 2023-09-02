import { getDeepActiveElement } from '../../util/getDeepActiveElement.js';
import { KeyboardShortcutName } from './types/KeyboardShortcutName.js';

/**
 * A key and any relevant modifier keys to be used in a keyboard shortcut.
 */
type KeyCombo = {
	key: KeyboardEvent['key'];
	/**
	 * Whether or not the Ctrl / Cmd key must be pressed for this key combo to fiie
	 * @default false
	 */
	ctrl?: boolean;
	/**
	 * Whether or not the Alt key must be pressed for this key combo to fiie
	 * @default false
	 */
	alt?: boolean;
	/**
	 * Whether or not the Shift key must be pressed for this key combo to fiie
	 * @default false
	 */
	shift?: boolean;
};

interface KeyboardShortcutInfo {
	name: KeyboardShortcutName;
	/**
	 * One or more key chords that can be used to fire this keyboard shortcut.
	 */
	shortcuts: Array<KeyCombo>;
	listeners: Array<() => void>;
}

export const keyboardShortcutsRegister = new Map<KeyboardShortcutName, KeyboardShortcutInfo>();

/**
 * Check if a specific key combo was pressed.
 */
function keyComboWasPressed(keyCombo: KeyCombo, e: KeyboardEvent): boolean {
	const wasPressed = (
		keyCombo.key === e.key &&
		(keyCombo.ctrl ?? false) === (e.ctrlKey || e.metaKey) &&
		(keyCombo.alt ?? false) === e.altKey &&
		(keyCombo.shift ?? false) === e.shiftKey
	);

	return wasPressed;
}

/**
 * Check if any of the key combos for a given keyboard shortcut have been pressed.
 */
function keyboardShortcutWasPressed(shortcutInfo: KeyboardShortcutInfo, e: KeyboardEvent): boolean {
	for (const keyCombo of shortcutInfo.shortcuts) {
		if (keyComboWasPressed(keyCombo, e)) {
			return true;
		}
	}

	return false;
}

// Add a single event listener to handle all keyboard shortcuts.
document.addEventListener('keydown', (e) => {
	// If a modifier key was pressed, ignore the event
	if (['Control', 'Alt', 'Shift'].includes(e.key)) {
		return;
	}

	// If keyboard focus is in an interactive element...
	const activeElement = getDeepActiveElement();
	if (
		activeElement instanceof HTMLInputElement ||
		activeElement instanceof HTMLSelectElement ||
		activeElement instanceof HTMLTextAreaElement ||
		(activeElement instanceof HTMLElement && activeElement.isContentEditable)
	) {
		// ...unless the Ctrl / Cmd modifier key is also pressed, ignore the event
		if (!(e.ctrlKey || e.metaKey)) {
			return;
		}
	}

	// Determine which keyboard shortcuts have been pressed
	const shortcuts = Array.from(keyboardShortcutsRegister.values());
	const matchingShortcuts = shortcuts.filter((item) => keyboardShortcutWasPressed(item, e));

	if (matchingShortcuts.length > 0) {
		e.preventDefault();
	}

	// Fire all listeners for pressed shortcuts
	for (const shortcut of matchingShortcuts) {
		for (const listener of shortcut.listeners) {
			listener();
		}
	}
});

/**
 * Register a keyboard shortcut, so listeners can be bound to it.
 *
 * A keyboard shortcut can be re-registered to override its shortcuts.
 */
export function registerKeyboardShortcut(name: KeyboardShortcutName, shortcuts: Array<KeyCombo>): void {
	const listeners = keyboardShortcutsRegister.get(name)?.listeners ?? [];

	keyboardShortcutsRegister.set(name, {
		name,
		shortcuts,
		listeners,
	});
}
