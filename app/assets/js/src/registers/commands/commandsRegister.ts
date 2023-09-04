// Type-only import to make symbol available to JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { useCommand } from './hooks/useCommand.js';

import { KeyboardShortcutName } from '../keyboard-shortcuts/index.js';

import { CommandInfo, CommandId, CommandListener, CommandsList } from './types/index.js';

export type CommandEntry = {
	commandInfo: CommandInfo;
	listeners: CommandListener[];
	shortcuts: KeyboardShortcutName[];
};

export const commandsRegister = new Map<CommandId, CommandEntry>();

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
		shortcuts: [],
	});

	for (const listener of newCommandRegisteredListeners) {
		listener(commandInfo);
	}
}

/**
 * Get a list of all registered commands.
 */
export function getCommands(): ReadonlyArray<Readonly<CommandEntry>> {
	return Array.from(
		commandsRegister.values()
	).map((entry) => (entry));
}

/**
 * Get the entry for a single specified command.
 */
export function getCommand(commandId: CommandId): CommandEntry {
	const entry = commandsRegister.get(commandId);

	if (!entry) {
		throw new Error(`Cannot get entry for unregistered command ${commandId}`);
	}

	return entry;
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
