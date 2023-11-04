import { commandsRegister } from './commandsRegister';
import type { CommandsList } from './types/CommandsList';
import type { CommandId } from './types/CommandId';

type FireCommandArgs = {
	[C in CommandId]: [command: C, ...args: CommandsList[C] | []];
}[CommandId]

/**
 * Call all listeners bound to a specified command.
 *
 * @param command A string ID identifying a command.
 * @param args Any arguments to pass to the commands' listeners.
 */
export function fireCommand(
	...[command, ...args]: FireCommandArgs
): void {
	const commandInfo = commandsRegister.get(command);

	if (!commandInfo) {
		return;
	}

	for (const listener of commandInfo.listeners.values()) {
		listener(...args);
	}
}
