import { getDeepActiveElement } from '../../util/index.js';

import { KeyCombo, KeyboardShortcutInfo, KeyboardShortcutName } from './types/index.js';

export const keyboardShortcutsRegister = new Map<KeyboardShortcutName, KeyboardShortcutInfo>();

export interface NewKeyboardShortcutRegisteredListener {
	(shortcutName: KeyboardShortcutInfo): void;
}

export const newKeyboardShortcutRegisteredListeners: Array<NewKeyboardShortcutRegisteredListener> = [];

/**
 * Check if a specific key combo was pressed.
 */
function keyComboWasPressed(keyCombo: KeyCombo, e: KeyboardEvent): boolean {
	if (keyCombo.key !== e.key) {
		return false;
	}

	// Ctrl/Meta key must match key combo requirements
	if (
		(keyCombo.ctrl ?? false) !== (e.ctrlKey || e.metaKey)
	) {
		return false;
	}

	// Alt key must match key combo requirements
	if (
		(keyCombo.alt ?? false) !== e.altKey
	) {
		return false;
	}

	// Shift key is ignored if not specified in key combo requirements
	if (
		typeof keyCombo.shift !== 'undefined' &&
		keyCombo.shift !== e.shiftKey
	) {
		return false;
	}

	return true;
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

/**
 * Get a list of all registered keyboard shortcuts.
 */
export function getKeyboardShortcuts(): ReadonlyArray<Readonly<KeyboardShortcutInfo>> {
	return Array.from(
		keyboardShortcutsRegister.values()
	).map((info) => ({ ...info }));
}

export function getKeyboardShortcut(name: KeyboardShortcutName): Readonly<KeyboardShortcutInfo> {
	const info = keyboardShortcutsRegister.get(name);

	if (!info) {
		throw new Error(`Cannot get info for unregistered keyboard shortcut ${name}`);
	}

	return info;
}
