// Type-only import to expose symbol to JSDoc
import type { encodeDayTaskKey } from './encodeDayTaskKey';

import type { RegisterKey } from 'utils';
import type { dayTasksRegister } from '../dayTasksRegister';
import type { DayTaskIdentifier } from '../types/DayTaskIdentifier';

/**
 * Decodes a key of the day tasks register into a
 * {@linkcode DayTaskIdentifier}
 *
 * @see {@linkcode encodeDayTaskKey} for the inverse operation.
 */
export function decodeDayTaskKey(key: RegisterKey<typeof dayTasksRegister>): DayTaskIdentifier {
	const [dayName, taskId] = key.split('_');

	if (!(dayName && taskId)) {
		throw new Error(`Invalid day task key ${key}`);
	}

	return {
		dayName,
		taskId: Number(taskId),
	};
}
