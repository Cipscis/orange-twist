import type {
	DayTaskIdentifier,
	DayTaskInfo,
} from './types';
import { dayTasksRegister } from './dayTasksRegister';
import { decodeDayTaskKey } from './util';

/**
 * Returns all day tasks that match a specified identifier.
 * If no identifier is specified, returns all day tasks.
 */
export function getAllDayTaskInfo(identifier?: Partial<DayTaskIdentifier>): DayTaskInfo[] {
	// If there's no identifier, return everything
	if (typeof identifier === 'undefined') {
		return Array.from(dayTasksRegister.values());
	}

	// If an identifier was given, return everything that matches
	const matchingEntries = Array.from(dayTasksRegister.entries()).filter(([key, value]) => {
		const { dayName, taskId } = decodeDayTaskKey(key);
		if (
			('dayName' in identifier && dayName !== identifier.dayName) ||
			('taskId' in identifier && taskId !== identifier.taskId)
		) {
			return false;
		}

		return true;
	});

	return matchingEntries.map(([key, value]) => value);
}
