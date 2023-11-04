import type { Task } from 'types/Task';

interface TasksChangeListener {
	(ids: ReadonlyArray<Readonly<Task>>): void;
}

export const tasksChangeListeners: Array<TasksChangeListener> = [];

interface OnTasksChangeOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

/**
 * Bind a callback to fire whenever the any task is changed.
 */
export function onTasksChange(
	listener: TasksChangeListener,
	options?: OnTasksChangeOptions,
): void {
	if (options?.signal?.aborted) {
		return;
	}

	// Mimic `addEventListener` by not adding duplicate listeners
	if (tasksChangeListeners.includes(listener)) {
		return;
	}

	tasksChangeListeners.push(listener);

	if (options?.signal) {
		options.signal.addEventListener(
			'abort',
			() => offTasksChange(listener),
		);
	}
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
