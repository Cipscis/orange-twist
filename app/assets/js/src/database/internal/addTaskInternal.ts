import { getIdbRequestPromise, type WithOptional } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

import { getTaskInternal } from './getTaskInternal';
import { getStatusInternal } from './getStatusInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to insert a new task to the task object store.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TASK} and {@linkcode ObjectStoreName.STATUS} object stores.
 * @param task The task object to insert.
 *
 * @returns A {@linkcode Promise} that resolves with the task's ID when it has been added.
 *
 * @throws Error if a task already exists with the specified ID.
 * @throws Error if the task is linked to a status ID that does not exist.
 * @throws TypeError if the database returns a non-number key after adding.
 */
export async function addTaskInternal(
	transaction: IDBTransaction,
	task: WithOptional<DatabaseData[typeof ObjectStoreName.TASK][number], 'id'>
): Promise<DatabaseData[typeof ObjectStoreName.TASK][number]['id']> {
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	if (typeof task.id !== 'undefined') {
		const existingTask = await getTaskInternal(transaction, task.id);
		if (existingTask) {
			throw new Error(`Cannot add task - task already exists with ID ${task.id}`);
		}
	}

	const status = await getStatusInternal(transaction, task.status);
	if (!status) {
		throw new Error(`Cannot add task with status ID ${task.status} - no such status exists`);
	}

	const request = taskOS.add(task);

	const result = await getIdbRequestPromise(request);
	if (!(typeof result === 'number')) {
		throw new TypeError(`The key for a task should be a number. Received ${JSON.stringify(result, null, '\t')}`);
	}

	return result;
}
