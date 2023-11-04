import type { CommandRegistration } from './types/CommandRegistration';
import type { CommandId } from './types/CommandId';

import { commandsRegister } from './commandsRegister';

interface RegisterCommandOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

/**
 * Registers a command, which allows listeners to be bound to it.
 *
 * @param command A string ID identifying a command.
 * @param info Metadata describing the command.
 * @param options An optional options object.
 */
export function registerCommand(
	command: CommandId,
	info: Pick<CommandRegistration, 'name'>,
	options?: RegisterCommandOptions
): void {
	if (options?.signal?.aborted) {
		return;
	}

	const existingCommandRegistration = commandsRegister.get(command);

	const newCommandRegistration: CommandRegistration = {
		// Set up defaults
		listeners: new Set(),
		shortcuts: new Set(),

		// Override defaults if there is existing info
		...existingCommandRegistration,

		// Override existing info
		id: command,
		...info,
	};

	commandsRegister.set(command, newCommandRegistration);

	if (options?.signal) {
		options.signal.addEventListener('abort', () => unregisterCommand(command));
	}
}

/**
 * Unregisters a command.
 *
 * @param command A string ID identifying a command.
 */
export function unregisterCommand(command: CommandId): void {
	commandsRegister.delete(command);
}
