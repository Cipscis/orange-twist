import type { EnumTypeOf } from 'utils';

export const ChangeEntityType = {
	DAY: 'day',
	TASK: 'task',
	DAY_TASK: 'day task',
} as const;
export type ChangeEntityType = EnumTypeOf<typeof ChangeEntityType>;

export const ChangeType = {
	ADD: 'add',
	CHANGE: 'change',
	DELETE: 'delete',
} as const;
export type ChangeType = EnumTypeOf<typeof ChangeType>;

/**
 * Internal record of {@linkcode EventTarget}s for various observable objects.
 */
export const eventTargetLookup = {
	[ChangeEntityType.DAY]: new Map<number, EventTarget>(),
	[ChangeEntityType.TASK]: new Map<number, EventTarget>(),
	[ChangeEntityType.DAY_TASK]: new Map<number, EventTarget>(),
};

/**
 * Trigger an event tracking a type of change against a specified item, causing any listeners for that type of change against that item to fire.
 */
export function noticeChange(type: ChangeEntityType, id: number, eventType: ChangeType = ChangeType.CHANGE): void {
	const changeTarget = eventTargetLookup[type].get(id);
	if (!changeTarget) {
		return;
	}

	changeTarget.dispatchEvent(new Event(eventType));
}

/**
 * Adds a listener for a specified type of change against a particular item.
 */
export function addChangeListener(
	eventType: ChangeType,
	type: ChangeEntityType,
	id: number,
	callback: () => void,
	options?: AddEventListenerOptions,
): void {
	const changeTarget = eventTargetLookup[type].getOrInsert(
		id,
		new EventTarget(),
	);

	changeTarget.addEventListener(eventType, callback, options);
}

/**
 * Removes a listener for a specified type of change against a particular item.
 */
export function removeChangeListener(
	eventType: ChangeType,
	type: ChangeEntityType,
	id: number,
	callback: () => void,
): void {
	const changeTarget = eventTargetLookup[type].get(id);
	if (!changeTarget) {
		return;
	}

	changeTarget.removeEventListener(eventType, callback);
}

/**
 * Internal record of {@linkcode EventTarget}s for various lists of objects.
 */
export const eventTargetListLookup = {
	[ChangeEntityType.DAY]: new EventTarget(),
	[ChangeEntityType.TASK]: new EventTarget(),
	[ChangeEntityType.DAY_TASK]: new EventTarget(),
};

/**
 * Trigger a "change" event for a list of a specified type of item, causing any change listeners for that list to fire.
 */
export function noticeListChange(type: Extract<ChangeEntityType, keyof typeof eventTargetListLookup>): void {
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
	type: Extract<ChangeEntityType, keyof typeof eventTargetListLookup>,
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
	type: Extract<ChangeEntityType, keyof typeof eventTargetListLookup>,
	callback: () => void,
): void {
	const changeTarget = eventTargetListLookup[type];
	if (!changeTarget) {
		return;
	}

	changeTarget.removeEventListener('change', callback);
}
