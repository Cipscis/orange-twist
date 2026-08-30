import { commandsRegister } from './commandsRegister';
import type { CommandsList } from './types/CommandsList';
import type { CommandId } from './types/CommandId';

/**
 * This immediately access indexed type constructs a
 * discriminated union of tuples that ensures the correct
 * combinations of arguments will be passed to {@linkcode fireCommand}.
 */
type FireCommandArgs = {
	[C in CommandId]: [command: C, ...args: CommandsList[C] | []];
}[CommandId];

/**
 * Call all listeners bound to a specified command.
 *
 * @param command A string ID identifying a command.
 * @param args Any arguments to pass to the commands' listeners.
 */
export async function fireCommand(
	...[command, ...args]: FireCommandArgs
): Promise<void> {
	const commandInfo = commandsRegister.get(command);

	if (!commandInfo) {
		return;
	}

	const promises: Promise<void>[] = [];
	for (const listener of commandInfo.listeners.values()) {
		promises.push(Promise.try(() => listener(...args)));
	}

	// This type assertion is safe because Promise<void> means the result should not be used
	return Promise.all(promises) as Promise<unknown> as Promise<void>;
}
