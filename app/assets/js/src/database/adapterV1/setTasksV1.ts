import type { TaskInfo } from 'data/tasks';

import { ObjectStoreName } from '../metadata';
import { getDatabase } from '../utils';
import {
	addTaskInternal,
	getStatusByAliasInternal,
	getTaskInternal,
	getTasksInternal,
	removeTaskInternal,
	updateTaskInternal,
} from '../internal';

/**
 * Overwrites all task information in the database v2, using {@linkcode TaskInfo} information from schema v1.
 */
export async function setTasksV1(
	tasks: readonly (readonly [number, TaskInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TASK,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.STATUS,
	], 'readwrite');

	const promises: (Promise<unknown>)[] = [];

	const priorTaskIds = new Set(
		(await getTasksInternal(transaction))
			.map(({ id }) => id)
	);
	const newTaskIds = new Set(tasks.map(([id]) => id));

	for (const [, taskInfo] of tasks) {
		const existingTask = await getTaskInternal(transaction, taskInfo.id);

		if (existingTask) {
			// Update an existing task
			promises.push(updateExistingTask(
				transaction,
				taskInfo,
			));
			continue;
		}

		// Create a new task
		const addNewTaskPromise = addNewTask(
			transaction,
			taskInfo,
		);
		promises.push(addNewTaskPromise);
	}

	// Remove any tasks not in the data
	const removedTaskIds = priorTaskIds.difference(newTaskIds);

	for (const id of removedTaskIds) {
		promises.push(removeTaskInternal(transaction, id));
	}

	await Promise.all(promises);
}

async function addNewTask(
	transaction: IDBTransaction,
	taskInfo: TaskInfo
): Promise<number> {
	const status = await getStatusByAliasInternal(transaction, taskInfo.status);
	if (!status) {
		throw new Error(`Cannot add task, no status exists with name ${taskInfo.status}`);
	}

	return await addTaskInternal(transaction, {
		id: taskInfo.id,
		name: taskInfo.name,
		note: taskInfo.note,
		sortIndex: taskInfo.sortIndex,
	});
}

async function updateExistingTask(
	transaction: IDBTransaction,
	taskInfo: TaskInfo,
): Promise<void> {
	const status = await getStatusByAliasInternal(transaction, taskInfo.status);

	if (status === null) {
		throw new Error(`Cannot give task ${taskInfo.id} status with alias ${taskInfo.status} - No such status exists`);
	}

	await updateTaskInternal(transaction, {
		id: taskInfo.id,
		name: taskInfo.name,
		note: taskInfo.note,
		sortIndex: taskInfo.sortIndex,
	});
}
