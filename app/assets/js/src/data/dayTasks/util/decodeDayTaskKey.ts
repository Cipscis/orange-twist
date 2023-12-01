// Type-only import to expose symbol to JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { encodeDayTaskKey } from './encodeDayTaskKey';

import type { RegisterKey } from 'util/register';
import type { dayTasksRegister } from '../dayTasksRegister';
import type { DayTaskIdentifier } from '../types/DayTaskIdentifier';

/**
 * Decodes a key of the day tasks register into a
 * {@linkcode DayTaskIdentifier}
 *
 * @see {@linkcode encodeDayTaskKey} for the inverse operation.
 */
export function decodeDayTaskKey(key: RegisterKey<typeof dayTasksRegister>): DayTaskIdentifier {
	const parts = key.match(/^(\d{4}-\d{2}-\d{2})_(\d+)$/);

	if (parts === null) {
		throw new Error(`Invalid day task key ${key}`);
	}

	return {
		dayName: parts[1],
		taskId: Number(parts[2]),
	};
}
