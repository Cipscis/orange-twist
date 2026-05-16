import { getIdbRequestPromise, getIterableCursor } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove a task and all its linked day tasks.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TASK} and {@linkcode ObjectStoreName.DAY_TASK} object stores.
 * @param id The ID of the task to delete.
 *
 * @returns A {@linkcode Promise} that resolves when the task and all its linked day tasks have been removed.
 */
export async function removeTaskInternal(
	transaction: IDBTransaction,
	id: number,
): Promise<void> {
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

	for await (const cursor of dayTaskIterableCursor) {
		requests.push(cursor.delete());
	}

	await Promise.all(requests.map(
		(request) => getIdbRequestPromise(request)
	));
}
