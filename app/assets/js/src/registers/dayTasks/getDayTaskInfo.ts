import type {
	DayTaskIdentifier,
	DayTaskInfo,
	DayTaskPartialIdentifier,
} from './types';
import { dayTasksRegister } from './dayTasksRegister';
import { decodeDayTaskKey, encodeDayTaskKey } from './util';
import { isDayTaskIdentifier } from './types/DayTaskIdentifier';

/**
 * Returns information for all day tasks.
 */
export function getDayTaskInfo(): DayTaskInfo[];
/**
 * Returns information for the specified day task, if any exists.
 */
export function getDayTaskInfo({ dayName, taskId }: DayTaskIdentifier): DayTaskInfo | null;
/**
 * Returns information for all day tasks that
 * match the specified day name or task ID.
 */
export function getDayTaskInfo(
	identifier: DayTaskPartialIdentifier
): DayTaskInfo[];
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function getDayTaskInfo(
	identifier?: DayTaskIdentifier | DayTaskPartialIdentifier
): DayTaskInfo[] | DayTaskInfo | null;
export function getDayTaskInfo(
	identifier?: DayTaskIdentifier | DayTaskPartialIdentifier
): DayTaskInfo[] | DayTaskInfo | null {
	// If there's no identifier, return everything
	if (typeof identifier === 'undefined') {
		return Array.from(dayTasksRegister.values());
	}

	// If a specific item was identified, return just that
	if (isDayTaskIdentifier(identifier)) {
		const key = encodeDayTaskKey(identifier);
		return dayTasksRegister.get(key) ?? null;
	}

	// If only partial identification was given, return everything that matches
	const matchingEntries = Array.from(dayTasksRegister.entries()).filter(([key, value]) => {
		const { dayName, taskId } = decodeDayTaskKey(key);
		if (
			('dayName' in identifier && dayName === identifier.dayName) ||
			('taskId' in identifier && taskId === identifier.taskId)
		) {
			return true;
		}

		return false;
	});

	return matchingEntries.map(([key, value]) => value);
}
