import type { EnumTypeOf } from 'utils';

export const ChangeEntityType = {
	DAY: 'day',
	TASK: 'task',
	DAY_TASK: 'day task',
} as const;
export type ChangeEntityType = EnumTypeOf<typeof ChangeEntityType>;

/**
 * A trimmed down representation of an item that can be observed for database changes.
 *
 * If `id` is omitted, all items of this type are represented.
 */
export interface ChangeEntity {
	type: ChangeEntityType;
	id?: number;
}

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
	[ChangeEntityType.DAY]: new Map<number | null, EventTarget>(),
	[ChangeEntityType.TASK]: new Map<number | null, EventTarget>(),
	[ChangeEntityType.DAY_TASK]: new Map<number | null, EventTarget>(),
};

/**
 * Trigger an event tracking a type of change against a specified item, causing any listeners for that type of change against that item to fire.
 */
export function noticeChange(
	eventType: ChangeType,
	{ type, id }: Required<ChangeEntity>
): void {
	const allChangeTarget = eventTargetLookup[type].get(null);
	if (allChangeTarget) {
		allChangeTarget.dispatchEvent(new Event(eventType));
	}

	const changeTarget = eventTargetLookup[type].get(id);
	if (changeTarget) {
		changeTarget.dispatchEvent(new Event(eventType));
	}
}

/**
 * Adds a listener for a specified type of change against a particular item.
 */
export function addChangeListener(
	eventType: ChangeType,
	{ type, id }: ChangeEntity,
	callback: () => void,
	options?: AddEventListenerOptions,
): void {
	const changeTargetId = id ?? null;
	const changeTarget = eventTargetLookup[type].getOrInsert(
		changeTargetId,
		new EventTarget(),
	);

	changeTarget.addEventListener(eventType, callback, options);
}

/**
 * Removes a listener for a specified type of change against a particular item.
 */
export function removeChangeListener(
	eventType: ChangeType,
	{ type, id }: ChangeEntity,
	callback: () => void,
): void {
	const changeTargetId = id ?? null;
	const changeTarget = eventTargetLookup[type].get(changeTargetId);
	if (!changeTarget) {
		return;
	}

	changeTarget.removeEventListener(eventType, callback);
}
