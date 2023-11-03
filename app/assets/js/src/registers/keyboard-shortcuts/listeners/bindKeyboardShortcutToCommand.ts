import { getCommand } from '../../commands/commandsRegister';
import type { CommandId } from '../../commands';
import { fireCommand } from '../../commands';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName';
import { addKeyboardShortcutListener, removeKeyboardShortcutListener } from './addKeyboardShortcutListener';

/**
 * Functions that can be used to fire commands.
 */
const bindings: Map<CommandId, () => void> = new Map();

/**
 * Retrieve a function that can be used to fire a specified command.
 */
function getBinding(command: CommandId): () => void {
	// If we already have a binding, return it
	const binding = bindings.get(command);
	if (binding) {
		return binding;
	}

	// Otherwise, create a binding and store it, then return it
	const fire = () => fireCommand(command);
	bindings.set(command, fire);
	return fire;
}

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

	const binding = getBinding(command);

	addKeyboardShortcutListener(shortcut, binding, { signal: options?.signal });

	// Tell commands register about shortcut so it can be displayed
	const commandEntry = getCommand(command);
	if (!commandEntry.shortcuts.includes(shortcut)) {
		commandEntry.shortcuts.push(shortcut);
	}

	options?.signal?.addEventListener(
		'abort',
		() => unbindKeyboardShortcutFromCommand(shortcut, command)
	);
}

/**
 * Unbinds a keyboard shortcut from a command, after it was
 * bound with {@linkcode bindKeyboardShortcutToCommand}.
 */
export function unbindKeyboardShortcutFromCommand(shortcut: KeyboardShortcutName, command: CommandId): void {
	const binding = getBinding(command);

	removeKeyboardShortcutListener(shortcut, binding);

	// Tell commands register to forget about shortcut
	const commandEntry = getCommand(command);
	const shortcutIndex = commandEntry.shortcuts.indexOf(shortcut);
	if (shortcutIndex !== -1) {
		commandEntry.shortcuts.splice(shortcutIndex, 1);
	}
}
