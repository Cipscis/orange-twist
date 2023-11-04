import type { CommandInfo } from './types/CommandInfo';
import type { CommandId } from './types/CommandId';

import { commandsRegister } from './commandsRegister';

/**
 * Retrieves information about a command.
 *
 * @param command A string ID identifying a command.
 * @returns An object containing information about the command if it is registered, otherwise `null`.
 */
export function getCommandInfo(
	command: CommandId
): CommandInfo | null;
/**
 * Retrieves information about all registered commands.
 *
 * @returns An array of objects containing information about all registered commands.
 */
export function getCommandInfo(): CommandInfo[];
export function getCommandInfo(
	command?: CommandId
): CommandInfo[] | CommandInfo | null {
	if (!command) {
		// If no command is specified, return information about all commands
		const entries = Array.from(commandsRegister.entries());
		const infoArray = entries.map(([command, fullInfo]) => {
			const {
				listeners,
				...info
			} = fullInfo;

			return info;
		});

		return infoArray;
	}

	const fullCommandInfo = commandsRegister.get(command);

	// If an unregistered command is specified, return null
	if (!fullCommandInfo) {
		return null;
	}

	// If a registered command is specified, return information about it
	const {
		listeners,
		...commandInfo
	} = fullCommandInfo;

	return commandInfo;
}
