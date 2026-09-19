import type { EnumTypeOf } from 'utils';

export const ChangeType = {
	DAY: 'day',
	TASK: 'task',
	DAY_TASK: 'day_task',
} as const;
export type ChangeType = EnumTypeOf<typeof ChangeType>;

/**
 * Internal record of {@linkcode EventTarget}s for various observable objects.
 */
export const eventTargetLookup = {
	[ChangeType.DAY]: new Map<number, EventTarget>(),
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
	const changeTarget = eventTargetLookup[type].get(id);
	if (!changeTarget) {
		return;
	}

	changeTarget.removeEventListener('change', callback);
}

/**
 * Internal record of {@linkcode EventTarget}s for various lists of objects.
 */
export const eventTargetListLookup = {
	[ChangeType.DAY]: new EventTarget(),
};

/**
 * Trigger a "change" event for a list of a specified type of item, causing any change listeners for that list to fire.
 */
export function noticeListChange(type: Extract<ChangeType, keyof typeof eventTargetListLookup>): void {
	const changeTarget = eventTargetListLookup[type];
	if (!changeTarget) {
		return;
	}

	changeTarget.dispatchEvent(new Event('change'));
}

/**
 * Adds a "change" listener for a list of a specified type of item.
 */
export function addListChangeListener(
	type: Extract<ChangeType, keyof typeof eventTargetListLookup>,
	callback: () => void,
	options?: AddEventListenerOptions,
): void {
	const changeTarget = eventTargetListLookup[type];

	changeTarget.addEventListener('change', callback, options);
}

/**
 * Removes a "change" listener for a list of a specified type of item.
 */
export function removeListChangeListener(
	type: Extract<ChangeType, keyof typeof eventTargetListLookup>,
	callback: () => void,
): void {
	const changeTarget = eventTargetListLookup[type];
	if (!changeTarget) {
		return;
	}

	changeTarget.removeEventListener('change', callback);
}
