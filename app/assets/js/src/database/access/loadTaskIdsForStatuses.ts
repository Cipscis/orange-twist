import {
	assertAllUnionMembersHandled,
	sortBySortIndex,
	type DefaultsFor,
	type EnumTypeOf,
} from 'utils';

import type { Day, Task } from '../types';
import { sortDaysChronologically } from '../utils';
import {
	getAllCanonicalDayTasksInternal,
	getAllTaskIdsInternal,
	getDaysInternal,
	getTasksInternal,
} from '../internal';
import { ObjectStoreName } from '../metadata';

import { requestTransaction } from './requestTransaction';

export interface LoadTaskIdsForStatusesOptions {
	/**
	 * The sorting method to use before returning tasks. See {@linkcode TaskSortingMethod}.
	 */
	sortingMethod?: TaskSortingMethod;
}

export const TaskSortingMethod = {
	/**
	 * Sort tasks according to their innate `sortIndex` property.
	 */
	TASK_SORTINDEX: 'task sortIndex',
	/**
	 * Sort tasks in reverse chronological order based on the day associated with their canonical day task, so that tasks whose status was set more recently appear earlier in the list.
	 */
	REVERSE_CHRONOLOGICAL: 'reverse chronological',
} as const;
export type TaskSortingMethod = EnumTypeOf<typeof TaskSortingMethod>;

const defaults = {
	sortingMethod: TaskSortingMethod.TASK_SORTINDEX,
} as const satisfies DefaultsFor<LoadTaskIdsForStatusesOptions>;

/**
 * Loads a list of task IDs for tasks with one of a given set of statuses, sorted according to the {@linkcode LoadTaskIdsForStatusesOptions.sortingMethod sortingMethod} option.
 *
 * A task's status is determined by its canonical day task - the day task with the latest date. If a task has no day tasks, it has the default status.
 *
 * @param statuses The set of statuses that a retrieved task should have.
 * @param options Optional configuration, see {@linkcode LoadTaskIdsForStatusesOptions}.
 */
export async function loadTaskIdsForStatuses(
	statuses: Iterable<number>,
	options?: LoadTaskIdsForStatusesOptions
): Promise<readonly number[]> {
	const {
		sortingMethod,
	} = {
		...defaults,
		...options,
	};

	const statusesArr = Array.from(statuses);

	const transaction = await requestTransaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.TASK,
	], 'readonly');

	// Get all canonical day tasks so we know all tasks' statuses
	const canonicalDayTasks = await getAllCanonicalDayTasksInternal(transaction);
	const canonicalDayTasksWithCorrectStatus = canonicalDayTasks
		.filter(({ status }) => statusesArr.includes(status));

	// Filter down to day tasks with a status in statusesArr
	const taskIds = canonicalDayTasksWithCorrectStatus
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

	if (sortingMethod === TaskSortingMethod.TASK_SORTINDEX) {
		// Sort the task indices by task sortIndex
		const sortedTasks = sortBySortIndex(tasks);

		const sortedTaskIds = sortedTasks.map(({ id }) => id);
		return sortedTaskIds;
	} else if (sortingMethod === TaskSortingMethod.REVERSE_CHRONOLOGICAL) {
		// Sort the tasks in reverse chronological order according to their canonical day tasks' days

		// First, get the day for each day task and sort them in reverse chronological order
		const canonicalDayTaskDayIds = new Set(canonicalDayTasksWithCorrectStatus.map(({ day }) => day));
		// This type assertion is safe because we know all the days we're looking up exist, because they're referenced by a day task
		const canonicalDayTaskDays = await getDaysInternal(transaction, canonicalDayTaskDayIds) as readonly Day[];
		const sortedCanonicalDayTaskDays = canonicalDayTaskDays.toSorted(
			(dayA, dayB) => {
				return -sortDaysChronologically(dayA, dayB);
			}
		);

		// Then, apply that sorting to each canonical day task
		const sortedCanonicalDayTasks = sortedCanonicalDayTaskDays.flatMap(
			({ id }) => {
				const matchingDayTasks = canonicalDayTasksWithCorrectStatus.filter(
					({ day }) => day === id
				);

				// TODO: Apply any tie-breakers
				return matchingDayTasks;
			}
		);

		// Finally, return the tasks for those sorted canonical day tasks
		const sortedTasks = sortedCanonicalDayTasks.map(({ task }) => task);
		return sortedTasks;
	} else {
		assertAllUnionMembersHandled(sortingMethod);
	}
}
