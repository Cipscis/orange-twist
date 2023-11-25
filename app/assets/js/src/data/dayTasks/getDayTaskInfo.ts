import type {
	DayTaskIdentifier,
	DayTaskInfo,
} from './types';
import { dayTasksRegister } from './dayTasksRegister';
import { encodeDayTaskKey } from './util';

/**
 * Returns information for the specified day task, if any exists.
 */
export function getDayTaskInfo(identifier: DayTaskIdentifier): DayTaskInfo | null {
	const key = encodeDayTaskKey(identifier);
	return dayTasksRegister.get(key) ?? null;
}
