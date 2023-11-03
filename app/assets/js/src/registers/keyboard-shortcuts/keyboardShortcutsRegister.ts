// Type-only import to make symbol available to JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { registerKeyboardShortcut } from './registerKeyboardShortcut';

import { getDeepActiveElement } from 'util/index';

import type { KeyCombo, KeyboardShortcutInfo } from './types';
import { KeyboardShortcutName } from './types';

/**
 * A central register for keeping track of keyboard shortcuts.
 *
 * See {@linkcode registerKeyboardShortcut} for how to register keyboard shortcuts.
 */
export const keyboardShortcutsRegister = new Map<KeyboardShortcutName, KeyboardShortcutInfo>();

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
