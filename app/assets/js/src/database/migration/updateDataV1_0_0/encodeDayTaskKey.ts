// Type-only import to expose symbol to JSDoc
import type { decodeDayTaskKey } from './decodeDayTaskKey';

import type { DayTaskIdentifier } from './DayTaskIdentifier';

/**
 * Encodes a {@linkcode DayTaskIdentifier} into a
 * key that can be used to look up a day task in
 * the register.
 *
 * @see {@linkcode decodeDayTaskKey} for the inverse operation.
 */
export function encodeDayTaskKey({ dayName, taskId }: DayTaskIdentifier): `${string}_${number}` {
	return `${dayName}_${taskId}`;
}
