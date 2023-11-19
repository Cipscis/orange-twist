import type { TaskStatus } from 'types/TaskStatus';
import { getTaskInfo, type DayTaskIdentifier, getDayTaskInfo } from 'data';

export function getTaskStatusForDay(
	{ dayName, taskId }: DayTaskIdentifier
): TaskStatus | null {
	// If the task doesn't exist, return null
	const taskInfo = getTaskInfo(taskId);
	if (taskInfo === null) {
		return null;
	}

	// If the task has a status on this day, return it
	const dayTaskInfo = getDayTaskInfo({ dayName, taskId });
	if (dayTaskInfo) {
		return dayTaskInfo.status;
	}

	// If the task has no task days, return its status
	const allDayTaskInfo = getDayTaskInfo({ taskId });
	if (allDayTaskInfo.length === 0) {
		return taskInfo.status;
	}

	// Construct a set of dayName / status tuples to work with
	const allDaysWithInfo = allDayTaskInfo.map(
		({ dayName, status }) => [dayName, status] as const
	);
	const currentDayWithInfo = [dayName, taskInfo.status] as const;

	// Sort chronologically so we can determine what day's status to use
	const sortedDays = [...allDaysWithInfo, currentDayWithInfo].sort(
		([dayNameA], [dayNameB]) => {
			return dayNameA.localeCompare(dayNameB);
		}
	);

	// If the task has no day information this early, return null
	if (sortedDays[0][0] === dayName) {
		return null;
	}

	// If the task has no day information this late, return its status
	if (sortedDays[sortedDays.length - 1][0] === dayName) {
		return taskInfo.status;
	}

	// Return the status at the prior day name
	const dayNameIndex = sortedDays.findIndex(([dayNameEl]) => dayNameEl === dayName);
	const dayToUse = sortedDays[dayNameIndex - 1];
	return dayToUse[1];
}
