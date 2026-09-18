import type { EnumTypeOf } from 'utils';

export const ChangeType = {
	TASK: 'task',
	DAY_TASK: 'day_task',
} as const;
export type ChangeType = EnumTypeOf<typeof ChangeType>;

/**
 * Internal record of {@linkcode EventTarget}s for various observable objects.
 */
export const eventTargetLookup = {
	[ChangeType.TASK]: new Map<number, EventTarget>(),
	[ChangeType.DAY_TASK]: new Map<number, EventTarget>(),
};

/**
 * Trigger a "change" event for a specified type of item, causing any change listeners for that item to fire.
 */
export function noticeChange(type: ChangeType, id: number): void {
	const changeTarget = eventTargetLookup[type].get(id);
	if (!changeTarget) {
		return;
	}

	changeTarget.dispatchEvent(new Event('change'));
}

/**
 * Adds a "change" listener for a specified type of item.
 */
export function addChangeListener(
	type: ChangeType,
	id: number,
	callback: () => void,
	options?: AddEventListenerOptions,
): void {
	const changeTarget = eventTargetLookup[type].getOrInsert(
		id,
		new EventTarget(),
	);

	changeTarget.addEventListener('change', callback, options);
}

/**
 * Removes a "change" listener for a specified type of item.
 */
export function removeChangeListener(
	type: ChangeType,
	id: number,
	callback: () => void,
): void {
	const changeTarget = eventTargetLookup.task.get(id);
	if (!changeTarget) {
		return;
	}

	changeTarget.removeEventListener('change', callback);
}
