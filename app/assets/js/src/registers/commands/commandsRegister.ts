// Type-only import to make symbol available to JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { useCommand } from './hooks/useCommand.js';

import { newCommandRegisteredListeners } from './listeners/onNewCommandRegistered.js';

/**
 * This interface is used to allow the list of commands to be extended
 * through [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
 * to allow new commands to have type information associated with them
 * that carries through to the Commands API.
 *
 * Once a command has been defined, it can be registered with {@linkcode registerCommand}.
 *
 * @example
 * ```typescript
 * declare module './path/to/commandsRegister.js' {
 *     interface CommandsList {
 *         ['my-command-id']: {
 *             name: 'MyCommandName';
 *             arguments: [argName: string];
 *         };
 *     }
 * }
 * ```
 */
/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface CommandsList {
	// Commands are added here in place where they are registered
}

export type CommandId = keyof CommandsList;

export type Command<C extends CommandId = CommandId> = {
	id: C;
	name: CommandsList[C]['name'];
};

export type CommandArgs<C extends CommandId = CommandId> = CommandsList[C]['arguments'] | [];

export type CommandListener<C extends CommandId = CommandId> = (...args: CommandArgs<C>) => void;

const commandsRegister = new Map<
	CommandId,
	{
		command: Command;
		listeners: CommandListener[];
	}
>();

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
export function registerCommand<C extends CommandId>(command: Command<C>): void {
	commandsRegister.set(command.id, {
		command,
		listeners: [],
	});

	for (const listener of newCommandRegisteredListeners) {
		listener(command);
	}
}

/**
 * Get a list of all registered commands.
 */
export function getCommands(): ReadonlyArray<Readonly<Command>> {
	return Array.from(
		commandsRegister.values()
	).map(({ command }) => command);
}

export function addCommandListener<C extends CommandId>(id: C, listener: CommandListener): void {
	const command = commandsRegister.get(id);
	if (!command) {
		throw new RangeError(`Cannot add listener to unregistered command ${id}`);
	}

	const { listeners } = command;
	if (listeners.includes(listener)) {
		// Like `addEventListener`, don't allow the same listener to be bound multiple times
		return;
	}

	listeners.push(listener);
}

export function removeCommandListener<C extends CommandId>(id: C, listener: CommandListener): void {
	const command = commandsRegister.get(id);
	if (!command) {
		throw new RangeError(`Cannot remove listener from unregistered command ${id}`);
	}

	const { listeners } = command;
	const listenerIndex = listeners.indexOf(listener);
	if (listenerIndex === -1) {
		// Like `removeEventListener`, just return silently if the listener wasn't bound
		return;
	}

	listeners.splice(listenerIndex, 1);
}

export function fireCommand<C extends CommandId>(id: C, ...args: CommandArgs<C>): void {
	const command = commandsRegister.get(id);
	if (!command) {
		throw new RangeError(`Cannot fire unregistered command ${id}`);
	}

	const { listeners } = command;
	for (const listener of listeners) {
		listener(...args);
	}
}
