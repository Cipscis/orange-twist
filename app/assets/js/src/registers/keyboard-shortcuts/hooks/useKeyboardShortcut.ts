import { useEffect } from 'preact/hooks';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName.js';
import { addKeyboardShortcutListener, removeKeyboardShortcutListener } from '../listeners/addKeyboardShortcutListener.js';

import { CommandId } from '../../commands/index.js';
import { bindKeyboardShortcutToCommand, unbindKeyboardShortcutFromCommand } from '../listeners/bindKeyboardShortcutToCommand.js';

/**
 * Bind a keyboard shortcut within a Preact component.
 */
export function useKeyboardShortcut(name: KeyboardShortcutName, listener: () => void): void
/**
 * Bind a keyboard shortcut to a command within a Preact component.
 */
export function useKeyboardShortcut(name: KeyboardShortcutName, command: CommandId): void
export function useKeyboardShortcut(
	name: KeyboardShortcutName,
	listenerOrCommand: (() => void) | CommandId,
): void {
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		if (typeof listenerOrCommand === 'function') {
			addKeyboardShortcutListener(name, listenerOrCommand, { signal });
		} else {
			bindKeyboardShortcutToCommand(name, listenerOrCommand, { signal });
		}

		return () => controller.abort();
	}, [name, listenerOrCommand]);
}
