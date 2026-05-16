import type { TaskInfo } from 'data/tasks';

import { ObjectStoreName } from '../metadata';
import { getDatabase } from '../utils';
import {
	addTaskInternal,
	getStatusByNameInternal,
	getTaskInternal,
	getTasksInternal,
	removeTaskInternal,
	updateTaskInternal,
} from '../internal';

export async function setTasksV1(
	tasks: readonly (readonly [number, TaskInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TASK,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.STATUS,
	], 'readwrite');

	const taskOS = transaction.objectStore(ObjectStoreName.TASK);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

	const promises: (Promise<unknown>)[] = [];

	const priorTaskIds = new Set((await getTasksInternal(taskOS)).map(({ id }) => id));
	const newTaskIds = new Set(tasks.map(([id]) => id));

	for (const [, taskInfo] of tasks) {
		const existingTask = await getTaskInternal(taskOS, taskInfo.id);

		if (existingTask) {
			promises.push(updateExistingTask({
				transaction,
				taskOS,
				statusOS,
				taskInfo,
			}));
			continue;
		}

		// Create a new task
		const addNewTaskPromise = addNewTask({
			transaction,
			taskInfo,
		});
		promises.push(addNewTaskPromise);
	}

	// Remove any tasks not in the data
	const removedTaskIds = priorTaskIds.difference(newTaskIds);

	for (const id of removedTaskIds) {
		promises.push(removeTaskInternal(taskOS, dayTaskOS, id));
	}

	await Promise.all(promises);
}

async function addNewTask(options: {
	transaction: IDBTransaction;
	taskInfo: TaskInfo;
}): Promise<number> {
	const {
		transaction,
		taskInfo,
	} = options;

	const status = await getStatusByNameInternal(transaction, taskInfo.status);
	if (!status) {
		throw new Error(`Cannot add task, no status exists with name ${taskInfo.status}`);
	}

	return await addTaskInternal(transaction, {
		id: taskInfo.id,
		name: taskInfo.name,
		note: taskInfo.note,
		sortIndex: taskInfo.sortIndex,
		status: status.id,
	});
}

async function updateExistingTask(options: {
	transaction: IDBTransaction;
	taskOS: IDBObjectStore;
	statusOS: IDBObjectStore;
	taskInfo: TaskInfo;
}): Promise<void> {
	const {
		transaction,
		taskOS,
		statusOS,
		taskInfo,
	} = options;

	const status = await getStatusByNameInternal(transaction, taskInfo.status);

	if (status === null) {
		throw new Error(`Cannot give task ${taskInfo.id} status with name ${taskInfo.status} - No such status exists`);
	}

	await updateTaskInternal(taskOS, statusOS, {
		id: taskInfo.id,
		name: taskInfo.name,
		note: taskInfo.note,
		status: status.id,
		sortIndex: taskInfo.sortIndex,
	});
}
