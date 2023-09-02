import { CommandId, fireCommand } from '../../commands/index.js';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName.js';
import { addKeyboardShortcutListener } from './addKeyboardShortcutListener.js';

export function bindKeyboardShortcutToCommand(shortcut: KeyboardShortcutName, command: CommandId): void {
	addKeyboardShortcutListener(shortcut, () => fireCommand(command));
	// TODO: Make sure the commands register also knows about the shortcut binding
}

export function unbindKeyboardShortcutFromCommand(shortcut: KeyboardShortcutName, command: CommandId): void {
	// TODO
}
