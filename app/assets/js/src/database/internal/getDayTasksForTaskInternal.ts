import { getIdbRequestPromise } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { Day, DayTask } from '../types';
import { sortDaysChronologically } from '../utils';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all day tasks for a specified task.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY} and {@linkcode ObjectStoreName.DAY_TASK} object stores.
 * @param taskId The ID of the task whose day tasks should be retrieved.
 *
 * @returns A {@linkcode Promise} that resolves with an array containing all day tasks linked to the specified task, sorted chronologically according to their days.
 */
export async function getDayTasksForTaskInternal(
	transaction: IDBTransaction,
	taskId: number,
): Promise<
	DayTask[]
> {
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const dayTaskByTask = dayTaskOS.index(IndexName.DAY_TASK_TASK);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const dayTasksRequest = dayTaskByTask.getAll(taskId) as IDBRequest<
		DayTask[]
	>;

	const dayTasks = await getIdbRequestPromise(dayTasksRequest);
	if (dayTasks.length <= 1) {
		return dayTasks;
	}

	// Get the day information for each day task so it can be used to sort them
	const dayRequests = dayTasks.map(
		// This type assertion is safe because of other controls around what can be inserted into the database
		({ day }) => dayOS.get(day) as IDBRequest<Day>
	);
	// Just wait for the last request to save effort on function overhead
	await getIdbRequestPromise(
		// This non-null assertion is safe because we already ensured there are at least two day task results
		dayRequests.at(-1)!
	);
	const days = dayRequests.map(({ result }) => result);

	// Sort days chronologically, then apply that sorting to the day tasks by looking up which one has which day
	const sortedDays = days.toSorted(sortDaysChronologically);
	const sortedDayTasks = sortedDays.map(
		// This non-null assertion is safe because we looked up the days from the day tasks, so a day task for each day must exist
		({ id: dayId }) => dayTasks.find(({ day }) => day === dayId)!
	);

	return sortedDayTasks;
}
