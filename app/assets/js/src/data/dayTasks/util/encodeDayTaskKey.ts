// Type-only import to expose symbol to JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { decodeDayTaskKey } from './decodeDayTaskKey';

import type { RegisterKey } from 'utils';
import type { dayTasksRegister } from '../dayTasksRegister';
import type { DayTaskIdentifier } from '../types/DayTaskIdentifier';

/**
 * Encodes a {@linkcode DayTaskIdentifier} into a
 * key that can be used to look up a day task in
 * the register.
 *
 * @see {@linkcode decodeDayTaskKey} for the inverse operation.
 */
export function encodeDayTaskKey({ dayName, taskId }: DayTaskIdentifier): RegisterKey<typeof dayTasksRegister> {
	return `${dayName}_${taskId}`;
}
