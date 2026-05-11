import type { TaskInfo } from 'data/tasks';

import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import { getDatabase } from '../utils';
import type { DatabaseData } from '../types';
import { addTaskInternal, getStatusByNameInternal } from '../internal';

export async function setTasksV1(
	tasks: readonly (readonly [number, TaskInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TASK,
		ObjectStoreName.STATUS,
	], 'readwrite');

	const taskOS = transaction.objectStore(ObjectStoreName.TASK);
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

	const promises: (Promise<unknown>)[] = [];

	for (const [, taskInfo] of tasks) {
		const existingTask = await getIdbRequestPromise(
			// TODO: Find a type-safe way of doing this
			taskOS.get(taskInfo.id) as IDBRequest<DatabaseData[typeof ObjectStoreName.TASK][number] | undefined>
		);

		if (existingTask) {
			// TODO: Update existing task
			continue;
		}

		// Create a new task
		const addNewTaskPromise = addNewTask({
			taskOS,
			statusOS,
			taskInfo,
		});
		promises.push(addNewTaskPromise);
	}

	// TODO: Remove any tasks not in the data
}

async function addNewTask(options: {
	taskOS: IDBObjectStore;
	statusOS: IDBObjectStore;
	taskInfo: TaskInfo;
}) {
	const {
		taskOS,
		statusOS,
		taskInfo,
	} = options;

	const status = await getStatusByNameInternal(statusOS, taskInfo.status);
	if (!status) {
		throw new Error(`Cannot add task, no status exists with name ${taskInfo.status}`);
	}

	await addTaskInternal(taskOS, statusOS, {
		id: taskInfo.id,
		name: taskInfo.name,
		note: taskInfo.note,
		sortIndex: taskInfo.sortIndex,
		status: status.id,
	});
}
