// Type-only import to make symbol available to JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { useCommand } from './hooks/useCommand.js';

import { CommandInfo, CommandId, CommandListener, CommandsList } from './types/index.js';

export const commandsRegister = new Map<
	CommandId,
	{
		commandInfo: CommandInfo;
		listeners: CommandListener[];
	}
>();

export interface NewCommandRegisteredListener {
	(command: CommandInfo): void;
}
export const newCommandRegisteredListeners: Array<NewCommandRegisteredListener> = [];

/**
 * Add a new command to the commands register.
 *
 * In order for a new command to be able to be added, it first needs to be defined
 * by extending the {@linkcode CommandsList} interface to add type information for it.
 *
 * Once a command has been registered, listeners can be bound to it via
 * {@linkcode addCommandListener} and the command can be first via {@linkcode fireCommand}.
 *
 * @see {@linkcode useCommand} for binding events in a Preact context.
 */
export function registerCommand<C extends CommandId>(commandInfo: CommandInfo<C>): void {
	commandsRegister.set(commandInfo.id, {
		commandInfo: commandInfo,
		listeners: [],
	});

	for (const listener of newCommandRegisteredListeners) {
		listener(commandInfo);
	}
}

/**
 * Get a list of all registered commands.
 */
export function getCommands(): ReadonlyArray<Readonly<CommandInfo>> {
	return Array.from(
		commandsRegister.values()
	).map(({ commandInfo: command }) => ({ ...command }));
}

/**
 * Fire a command, optionally passing any arguments its listeners accept as subsequent arguments.
 */
export function fireCommand<C extends CommandId>(id: C, ...args: CommandsList[C] | []): void {
	const command = commandsRegister.get(id);
	if (!command) {
		throw new RangeError(`Cannot fire unregistered command ${id}`);
	}

	const { listeners } = command;
	for (const listener of listeners) {
		listener(...args);
	}
}
