import { getIdbRequestPromise, getIterableCursor } from 'utils';

import type { DayTask } from '../types';
import { IndexName, ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove a task and all its linked day tasks.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TASK} and {@linkcode ObjectStoreName.DAY_TASK} object stores.
 * @param id The ID of the task to delete.
 *
 * @returns A {@linkcode Promise} that resolves to a list of removed day task IDs, once the task and all its linked day tasks have been removed.
 */
export async function removeTaskInternal(
	transaction: IDBTransaction,
	id: number,
): Promise<number[]> {
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const requests: IDBRequest[] = [];

	const taskCursor = await getIdbRequestPromise(taskOS.openCursor(id));

	if (!taskCursor) {
		// No cursor means the task doesn't exist
		throw new Error(`Cannot delete non-existent task with ID ${JSON.stringify(id)}`);
	}

	// Remove task
	const taskDeleteRequest = taskCursor.delete();
	requests.push(taskDeleteRequest);

	// Remove day tasks
	const dayTaskByTask = dayTaskOS.index(IndexName.DAY_TASK_TASK);
	const dayTaskIterableCursor = getIterableCursor(dayTaskByTask, id);
	const deletedDayTaskIds: number[] = [];

	for await (const cursor of dayTaskIterableCursor) {
		// This type assertion is save because we're iterating through an index on the day task object store
		const dayTask = cursor.value as DayTask;
		deletedDayTaskIds.push(dayTask.id);
		requests.push(cursor.delete());
	}

	// Only wait for the last request, to save time on function overhead
	// This non-null assertion is safe because requests always has at least one entry
	const lastRequest = requests.at(-1)!;
	await getIdbRequestPromise(lastRequest);

	return deletedDayTaskIds;
}
