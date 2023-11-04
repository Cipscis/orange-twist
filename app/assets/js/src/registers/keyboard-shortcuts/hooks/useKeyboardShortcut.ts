import type {
	CommandId,
	// Type-only import to make symbol available to JSDoc
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	useCommand,
} from 'registers/commands';

import { useEffect } from 'preact/hooks';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName';
import { addKeyboardShortcutListener } from '../listeners/addKeyboardShortcutListener';

import { bindKeyboardShortcutToCommand } from '../listeners/bindKeyboardShortcutToCommand';

/**
 * Bind a callback to a keyboard shortcut, within a Preact component.
 */
export function useKeyboardShortcut(name: KeyboardShortcutName, listener: () => void): void;
/**
 * Bind a keyboard shortcut to fire a command, within a Preact component.
 *
 * For binding callbacks to commands, see {@linkcode useCommand}
 */
export function useKeyboardShortcut(name: KeyboardShortcutName, command: CommandId): void;
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
