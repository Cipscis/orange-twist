import { ObjectStoreName } from '../metadata';
import type { EnumTypeOf } from 'utils';

export const ChangeEntityType = {
	DAY: ObjectStoreName.DAY,
	TASK: ObjectStoreName.TASK,
	DAY_TASK: ObjectStoreName.DAY_TASK,
} as const satisfies Record<string, ObjectStoreName>;
export type ChangeEntityType = EnumTypeOf<typeof ChangeEntityType>;

/**
 * A trimmed down representation of an item that can be observed for database changes.
 */
export interface QualifiedChangeEntity<T extends ChangeEntityType> {
	readonly type: T;
	readonly id: number;
}

/**
 * A trimmed down representation of a _type_ of item that can be observed for database changes.
 */
export interface UnqualifiedChangeEntity<T extends ChangeEntityType> {
	readonly type: T;
}

/**
 * A combination of {@linkcode QualifiedChangeEntity} and {@linkcode UnqualifiedChangeEntity}, representing either a specific item or a type of item that can be observed for database changes.
 */
export interface ChangeEntity<T extends ChangeEntityType> {
	readonly type: T;
	readonly id?: number;
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
export function noticeChange<T extends ChangeEntityType>(
	eventType: ChangeType,
	{ type, id }: QualifiedChangeEntity<T>
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
 * Adds a listener for a specified type of change against a particular item or type of item.
 */
export function addChangeListener<T extends ChangeEntityType>(
	eventType: ChangeType,
	{ type, id }: ChangeEntity<T>,
	callback: (e: Event) => void,
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
 * Removes a listener for a specified type of change against a particular item or type of item.
 */
export function removeChangeListener<T extends ChangeEntityType>(
	eventType: ChangeType,
	{ type, id }: ChangeEntity<T>,
	callback: () => void,
): void {
	const changeTargetId = id ?? null;
	const changeTarget = eventTargetLookup[type].get(changeTargetId);
	if (!changeTarget) {
		return;
	}

	changeTarget.removeEventListener(eventType, callback);
}
