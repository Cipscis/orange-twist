import { sortBySortIndex } from 'utils';

import type { Task } from '../types';
import {
	getAllCanonicalDayTasksInternal,
	getAllTaskIdsInternal,
	getTasksInternal,
} from '../internal';
import { ObjectStoreName } from '../metadata';

import { requestTransaction } from './requestTransaction';

/**
 * Loads a list of task IDs for tasks with one of a given set of statuses, sorted by those tasks' `sortIndex` values.
 *
 * A task's status is determined by its canonical day task - the day task with the latest date. If a task has no day tasks, it has the default status.
 */
export async function loadTaskIdsForStatuses(statuses: Iterable<number>): Promise<readonly number[]> {
	const statusesArr = Array.from(statuses);

	const transaction = await requestTransaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.TASK,
	], 'readonly');

	// Get all canonical day tasks so we know all tasks' statuses
	const canonicalDayTasks = await getAllCanonicalDayTasksInternal(transaction);

	// Filter down to day tasks with a status in statusesArr
	const taskIds = canonicalDayTasks
		.filter(({ status }) => statusesArr.includes(status))
		.map(({ task }) => task);

	if (statusesArr.includes(1)) {
		// Include tasks without a canonical day task, as they have the default status

		// Get all task IDs
		const allTaskIds = new Set(await getAllTaskIdsInternal(transaction));

		// Filter down to task IDs without a canonical day task
		const taskIdsWithCanonicalDayTask = new Set(
			canonicalDayTasks.map(({ task }) => task)
		);
		const tasksWithoutCanonicalDayTask = allTaskIds.difference(taskIdsWithCanonicalDayTask);

		taskIds.push(...tasksWithoutCanonicalDayTask);
	}

	// Get all tasks in the array of task IDs
	// This type assertion is safe because we're only looking up tasks we already know exist
	const tasks = await getTasksInternal(transaction, taskIds) as readonly Task[];

	// Sort the task indices by task sortIndex
	const sortedTasks = sortBySortIndex(tasks);
	const sortedTaskIds = sortedTasks.map(({ id }) => id);

	return sortedTaskIds;
}
