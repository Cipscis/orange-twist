/**
 * Internal record of {@linkcode EventTarget}s for various observable objects.
 */
export const eventTargetLookup = {
	task: new Map<number, EventTarget>(),
};

/**
 * Trigger a "change" event for a specified task, causing any change listeners for that task to fire.
 */
export function noticeTaskChange(taskId: number): void {
	const taskChangeTarget = eventTargetLookup.task.get(taskId);
	if (!taskChangeTarget) {
		return;
	}

	taskChangeTarget.dispatchEvent(new Event('change'));
}

/**
 * Adds a "change" listener for a specified task.
 */
export function addTaskChangeListener(
	taskId: number,
	callback: () => void,
	options?: AddEventListenerOptions,
): void {
	const taskChangeTarget = eventTargetLookup.task.getOrInsert(
		taskId,
		new EventTarget(),
	);

	taskChangeTarget.addEventListener('change', callback, options);
}

/**
 * Removes a "change" listener for a specified task.
 */
export function removeTaskChangeListener(
	taskId: number,
	callback: () => void,
): void {
	const taskChangeTarget = eventTargetLookup.task.get(taskId);
	if (!taskChangeTarget) {
		return;
	}

	taskChangeTarget.removeEventListener('change', callback);
}
