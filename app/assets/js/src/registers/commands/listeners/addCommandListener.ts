// Type-only import just to expose the symbol to JSDoc.
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { useCommand } from '../hooks';

import type {
	CommandId,
	CommandListener,
	CommandWithListener,
} from '../types';

import { commandsRegister } from '../commandsRegister';

interface AddCommandListenerOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

type AddCommandListenerAgs = {
	[C in CommandId]: [commandId: C, listener: CommandListener<C>, options?: AddCommandListenerOptions]
}[CommandId];

/**
 * Bind a listener function a a specified command.
 *
 * @see {@linkcode removeCommandListener} for unbinding a listener.
 * @see {@linkcode useCommand} for binding listeners to commands within Preact components.
 */
export function addCommandListener(...[commandId, listener, options]: AddCommandListenerAgs): void {
	const command = commandsRegister.get(commandId);
	if (!command) {
		throw new RangeError(`Cannot add listener to unregistered command ${commandId}`);
	}

	if (options?.signal?.aborted) {
		return;
	}

	const { listeners } = command;
	if (listeners.includes(listener)) {
		// Like `addEventListener`, don't allow the same listener to be bound multiple times
		return;
	}

	options?.signal?.addEventListener(
		'abort',
		() => removeCommandListener(commandId, listener),
	);

	listeners.push(listener);
}

/**
 * Unbind a listener that was bound to a particular command using {@linkcode addCommandListener}.
 */
export function removeCommandListener(...[commandId, listener]: CommandWithListener): void {
	const command = commandsRegister.get(commandId);
	if (!command) {
		throw new RangeError(`Cannot remove listener from unregistered command ${commandId}`);
	}

	const { listeners } = command;
	const listenerIndex = listeners.indexOf(listener);
	if (listenerIndex === -1) {
		// Like `removeEventListener`, just return silently if the listener wasn't bound
		return;
	}

	listeners.splice(listenerIndex, 1);
}
