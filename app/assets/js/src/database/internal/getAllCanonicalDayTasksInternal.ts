import { sortDaysChronologically } from '../utils';
import type { Day, DayTask } from '../types';

import { getAllDayTasksInternal } from './getAllDayTasksInternal';
import { getDaysInternal } from './getDaysInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all canonical day tasks. A canonical day task is one which is the latest day task for its associated task.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY} and {@linkcode ObjectStoreName.DAY_TASK} object stores.
 *
 * @returns A {@linkcode Promise} that resolves to an array of all canonical day tasks, in no particular order.
 */
export async function getAllCanonicalDayTasksInternal(
	transaction: IDBTransaction
): Promise<readonly DayTask[]> {
	// Get all day tasks
	const dayTasks = await getAllDayTasksInternal(transaction);

	// Get all days associated with a day task
	const dayTaskDays = await getDaysInternal(
		transaction,
		// Use a set to quickly remove any duplicate Day IDs
		new Set(dayTasks.map(({ day }) => day)),
	);
	// Sort those days chronologically, and get their IDs
	// This type assertion is safe because we're only looking up days we know exist, due to being referenced from at least one day task
	const sortedDayIds = (dayTaskDays as Day[])
		.toSorted(sortDaysChronologically)
		.map(({ id }) => id);

	// Convert sorted days into an object where you can look up their sort index for faster sorting of day task groups
	const dayIdSortedIndices: Record<number, number> = Object.fromEntries(
		sortedDayIds.map((id, index) => [id, index])
	);

	// Group day tasks by task
	const groupedDayTasks = Map.groupBy(dayTasks, (({ task }) => task));

	// Sort each group of day tasks chronologically by using the sorted index of their associated day
	for (const [taskId, dayTasks] of groupedDayTasks.entries()) {
		const sortedDayTasks = dayTasks.toSorted((dayTaskA, dayTaskB) => {
			const dayA = dayTaskA.day;
			const dayB = dayTaskB.day;

			return dayIdSortedIndices[dayA] - dayIdSortedIndices[dayB];
		});

		groupedDayTasks.set(taskId, sortedDayTasks);
	}

	// Pick the last day task for each group to get that task's canonical day task
	const canonicalDayTasks: DayTask[] = [];
	for (const dayTasks of groupedDayTasks.values()) {
		// This non-null assertion is safe because groupedDayTasks won't have an entry unless the array will have at least one element
		canonicalDayTasks.push(dayTasks.at(-1)!);
	}

	return canonicalDayTasks;
}
