import { getDayInfo, setDayInfo } from 'data/days';

import { encodeDayTaskKey } from './util';
import {
	type DayTaskIdentifier,
} from './types';

import { dayTasksRegister } from './dayTasksRegister';
import { getAllDayTaskInfo } from './getAllDayTaskInfo';

/**
 * Deletes a specified day task.
 */
export function deleteDayTask(identifier: DayTaskIdentifier): void;
/**
 * Deletes all day tasks matching a partially specified identifier.
 */
export function deleteDayTask(identifier: Partial<DayTaskIdentifier>): void;
export function deleteDayTask(identifier?: Partial<DayTaskIdentifier>): void {
	// Collect all matching entries to delete
	const matchingDayTaskInfo = getAllDayTaskInfo(identifier);
	if (matchingDayTaskInfo.length === 0) {
		return;
	}

	// Convert to an array for ease of handling
	const matchingEntries = Array.isArray(matchingDayTaskInfo) ? matchingDayTaskInfo : [matchingDayTaskInfo];

	// Delete all matching day tasks
	const matchingEntryKeys = matchingEntries.map((entry) => encodeDayTaskKey(entry));
	dayTasksRegister.delete(...matchingEntryKeys);

	// Collect all tasks deleted from each day, so those days can be updated only once
	const daysWithDeletedTasks: Map<string, number[]> = new Map();
	for (const { dayName, taskId } of matchingEntries) {
		const tasks = (() => {
			let tasks = daysWithDeletedTasks.get(dayName);
			if (!tasks) {
				tasks = [];
				daysWithDeletedTasks.set(dayName, tasks);
			}

			return tasks;
		})();

		tasks.push(taskId);
	}

	// Loop through affected days, and remove deleted tasks
	for (const [dayName, deletedTasks] of daysWithDeletedTasks.entries()) {
		const dayInfo = getDayInfo(dayName);
		if (!dayInfo) {
			continue;
		}
		const oldDayTasks = dayInfo.tasks;
		const newDayTasks: number[] = [];

		for (const taskId of oldDayTasks) {
			// Only keep the tasks that haven't been deleted
			if (deletedTasks.indexOf(taskId) === -1) {
				newDayTasks.push(taskId);
			}
		}

		setDayInfo(dayName, { tasks: newDayTasks });
	}
}
