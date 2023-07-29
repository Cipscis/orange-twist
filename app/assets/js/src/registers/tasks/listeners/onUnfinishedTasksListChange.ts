import { Task } from '../../../types/Task.js';

interface UnfinishedTasksListChangeListener {
	(ids: ReadonlyArray<Readonly<Task>>): void;
}

export const unfinishedTasksListChangeListeners: Array<UnfinishedTasksListChangeListener> = [];

/**
 * Bind a callback to fire whenever the list of unnfinished tasks is changed.
 */
export function onUnfinishedTasksListChange(listener: UnfinishedTasksListChangeListener): void {
	// Mimic `addEventListener` by not adding duplicate listeners
	if (unfinishedTasksListChangeListeners.includes(listener)) {
		return;
	}

	unfinishedTasksListChangeListeners.push(listener);
}

/**
 * Unbind a callback bound to unfinished tasks list changes using {@linkcode onUnfinishedTasksListChange}
 */
export function offUnfinishedTasksListChange(listener: UnfinishedTasksListChangeListener): void {
	const listenerIndex = unfinishedTasksListChangeListeners.indexOf(listener);

	// If the listener exists, remove if
	if (listenerIndex !== -1) {
		unfinishedTasksListChangeListeners.splice(listenerIndex, 1);
	}
}
