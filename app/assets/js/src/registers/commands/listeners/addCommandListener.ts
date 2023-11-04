import { commandsRegister } from '../commandsRegister';

import type { CommandId } from '../types/CommandId';
import type { CommandsList } from '../types/CommandsList';

interface AddCommandListenerOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

/**
 * In order to ensure commands and listeners match one another,
 * this immediately indexed mapped type constructs a discriminated
 * union of tuples that can be narrowed together.
 */
type RemoveCommandListenerArgs = {
	[C in CommandId]: [
		command: C,
		listener: (...args: CommandsList[C] | []) => void
	];
}[CommandId];

/**
 * The same discriminated union of tuples as in {@linkcode RemoveCommandListenerArgs},
 * but with an optional {@linkcode AddCommandListenerOptions} argument appended.
 */
type AddCommandListenerArgs = [...RemoveCommandListenerArgs, options?: AddCommandListenerOptions];

type InferSetType<S extends Set<unknown>> = S extends Set<infer T> ? T : never;

/**
 * Binds a callback function to fire whenever a specified command it called.
 *
 * @param command A string ID identifying a command.
 * @param listener A function to be called whenever the specified command is fired.
 * @param [options] An object containing options.
 *
 * @see {@linkcode removeCommandListener} for removing listeners.
 */
export function addCommandListener(
	...[command, listener, options]: AddCommandListenerArgs
): void {
	const commandInfo = commandsRegister.get(command);

	// Throw an error if passed an unregistered command
	if (!commandInfo) {
		throw new Error(`Cannot add listener to unregistered command ${command}`);
	}

	// Do nothing if passed an aborted signal
	if (options?.signal?.aborted) {
		return;
	}

	const { listeners } = commandInfo;
	// This type assertion is safe because the type of `listener` is linked to the type of `command`
	// It's also necessary because `listeners` wrongly thinks it could accept a listener for any command
	listeners.add(listener as InferSetType<typeof listeners>);

	if (options?.signal) {
		options.signal.addEventListener(
			'abort',
			// This type assertion is safe because the types of `command` and `listener` are linked
			// It's also necessary because TypeScript can't see at this point that they are linked
			() => removeCommandListener(...[command, listener] as RemoveCommandListenerArgs)
		);
	}
}

/**
 * Unbinds a callback function that was bound to the specified command
 * with {@linkcode addCommandListener}
 *
 * @param command A string ID identifying a command.
 * @param listener A function to be called whenever the specified command is fired.
 * @param [options] An object containing options.
 */
export function removeCommandListener(...[command, listener]: RemoveCommandListenerArgs): void {
	const commandInfo = commandsRegister.get(command);

	// Throw an error if passed an unregistered command
	if (!commandInfo) {
		throw new Error(`Cannot add listener to unregistered command ${command}`);
	}

	const { listeners } = commandInfo;
	// This type assertion is safe because the type of `listener` is linked to the type of `command`
	// It's also necessary because `listeners` wrongly thinks it could accept a listener for any command
	listeners.delete(listener as InferSetType<typeof listeners>);
}
