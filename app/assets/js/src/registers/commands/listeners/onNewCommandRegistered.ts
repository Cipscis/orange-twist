import { Command } from '../commandsRegister.js';

interface NewCommandRegisteredListener {
	(command: Command): void;
}

export const newCommandRegisteredListeners: Array<NewCommandRegisteredListener> = [];

/**
 * Bind a callback to fire whenever a new command is registered.
 */
export function onNewCommandRegistered(listener: NewCommandRegisteredListener): void {
	// Mimic `addEventListener` by not adding duplicate listeners
	if (newCommandRegisteredListeners.includes(listener)) {
		return;
	}

	newCommandRegisteredListeners.push(listener);
}

/**
 * Unbind a callback bound to new command registrations using {@linkcode onNewCommandRegistered}
 */
export function offNewCommandRegistered(listener: NewCommandRegisteredListener): void {
	const listenerIndex = newCommandRegisteredListeners.indexOf(listener);

	// If the listener exists, remove it
	if (listenerIndex !== -1) {
		newCommandRegisteredListeners.splice(listenerIndex, 1);
	}
}
