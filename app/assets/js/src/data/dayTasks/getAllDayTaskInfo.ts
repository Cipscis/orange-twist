import type {
	DayTaskIdentifier,
	DayTaskInfo,
} from './types';
import { dayTasksRegister } from './dayTasksRegister';
import { decodeDayTaskKey } from './util';

/**
 * Returns information for all day tasks.
 */
export function getAllDayTaskInfo(): DayTaskInfo[];
/**
 * Returns all day tasks that match the specified identifier.
 */
export function getAllDayTaskInfo(identifier: Partial<DayTaskIdentifier>): DayTaskInfo[];
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function getAllDayTaskInfo(identifier?: Partial<DayTaskIdentifier>): DayTaskInfo[];
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
