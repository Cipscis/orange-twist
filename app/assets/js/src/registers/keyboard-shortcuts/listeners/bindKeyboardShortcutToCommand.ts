import { getCommand } from '../../commands/commandsRegister.js';
import { CommandId, fireCommand } from '../../commands/index.js';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName.js';
import { addKeyboardShortcutListener, removeKeyboardShortcutListener } from './addKeyboardShortcutListener.js';

const bindings: Map<CommandId, () => void> = new Map();

interface BindKeyboardShortcutToCommandOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

/**
 * Bind a specified keyboard shortcut to fire a specified command.
 *
 * @see {@linkcode unbindKeyboardShortcutFromCommand} for removing this binding.
 */
export function bindKeyboardShortcutToCommand(
	shortcut: KeyboardShortcutName,
	command: CommandId,
	options?: BindKeyboardShortcutToCommandOptions,
): void {
	if (options?.signal?.aborted) {
		return;
	}

	const binding = bindings.get(command);
	const fire = binding ?? (() => fireCommand(command));
	if (!binding) {
		bindings.set(command, fire);
	}

	addKeyboardShortcutListener(shortcut, () => fire, { signal: options?.signal });

	// Tell commands register about shortcut
	const commandEntry = getCommand(command);
	if (!commandEntry.shortcuts.includes(shortcut)) {
		commandEntry.shortcuts.push(shortcut);
	}
}

/**
 * Unbinds a keyboard shortcut from a command, after it was
 * bound with {@linkcode bindKeyboardShortcutToCommand}.
 */
export function unbindKeyboardShortcutFromCommand(shortcut: KeyboardShortcutName, command: CommandId): void {
	const binding = bindings.get(command);

	if (binding) {
		removeKeyboardShortcutListener(shortcut, binding);
	}

	// Tell commands register to forget about shortcut
	const commandEntry = getCommand(command);
	const shortcutIndex = commandEntry.shortcuts.indexOf(shortcut);
	if (shortcutIndex !== -1) {
		commandEntry.shortcuts.splice(shortcutIndex, 1);
	}
}
