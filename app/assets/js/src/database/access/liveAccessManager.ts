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
 * For observations not tied to a particular ID, e.g. when listening for {@linkcode ChangeType.ADD} events, use a negative ID like `-1`.
 */
export interface ChangeEntity {
	type: ChangeEntityType;
	id: number;
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
	[ChangeEntityType.DAY]: new Map<number, EventTarget>(),
	[ChangeEntityType.TASK]: new Map<number, EventTarget>(),
	[ChangeEntityType.DAY_TASK]: new Map<number, EventTarget>(),
};

/**
 * Trigger an event tracking a type of change against a specified item, causing any listeners for that type of change against that item to fire.
 */
export function noticeChange(eventType: ChangeType, { type, id }: ChangeEntity): void {
	const changeTargetId = getEventTargetId(eventType, { id });
	const changeTarget = eventTargetLookup[type].get(changeTargetId);
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
	{ type, id }: ChangeEntity,
	callback: () => void,
	options?: AddEventListenerOptions,
): void {
	const changeTargetId = getEventTargetId(eventType, { id });
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
	const changeTargetId = getEventTargetId(eventType, { id });
	const changeTarget = eventTargetLookup[type].get(changeTargetId);
	if (!changeTarget) {
		return;
	}

	changeTarget.removeEventListener(eventType, callback);
}

/**
 * Determines which ID to use for getting an event listener for a particular {@linkcode ChangeType} and {@linkcode ChangeEntity}. In most cases, this will be the {@linkcode ChangeEntity}'s ID, but for {@linkcode ChangeType.ADD} events `-1` is used instead to be linked only to a {@linkcode ChangeEntityType}.
 *
 * This allows changes and deletions to be watched for individual items, and add events to be watched for a type of item, since knowing the ID of an added item ahead of time is not possible.
 */
function getEventTargetId(eventType: ChangeType, { id }: Pick<ChangeEntity, 'id'>): number {
	// -1 represents all items
	const eventTargetId = eventType === ChangeType.ADD ? -1 : id;

	return eventTargetId;
}
