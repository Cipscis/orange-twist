import { Task } from '../../../types/Task.js';

interface TasksChangeListener {
	(ids: ReadonlyArray<Readonly<Task>>): void;
}

export const tasksChangeListeners: Array<TasksChangeListener> = [];

/**
 * Bind a callback to fire whenever the any task is changed.
 */
export function onTasksChange(listener: TasksChangeListener): void {
	// Mimic `addEventListener` by not adding duplicate listeners
	if (tasksChangeListeners.includes(listener)) {
		return;
	}

	tasksChangeListeners.push(listener);
}

/**
 * Unbind a callback bound to unfinished tasks list changes using {@linkcode onTasksChange}
 */
export function offTasksChange(listener: TasksChangeListener): void {
	const listenerIndex = tasksChangeListeners.indexOf(listener);

	// If the listener exists, remove if
	if (listenerIndex !== -1) {
		tasksChangeListeners.splice(listenerIndex, 1);
	}
}
