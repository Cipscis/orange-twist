import { getIdbRequestPromise, getIterableCursor } from 'utils';

import { IndexName } from '../metadata';

export async function removeTaskInternal(
	taskOS: IDBObjectStore,
	dayTaskOS: IDBObjectStore,
	id: number,
): Promise<void> {
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
