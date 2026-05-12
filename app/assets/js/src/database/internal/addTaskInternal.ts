import { getIdbRequestPromise, type WithOptional } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';
import { getTaskInternal } from './getTaskInternal';
import { getStatusInternal } from './getStatusInternal';

export async function addTaskInternal(
	taskOS: IDBObjectStore,
	statusOS: IDBObjectStore,
	task: WithOptional<DatabaseData[typeof ObjectStoreName.TASK][number], 'id'>
): Promise<DatabaseData[typeof ObjectStoreName.TASK][number]['id']> {
	if (typeof task.id !== 'undefined') {
		const existingTask = await getTaskInternal(taskOS, task.id);
		if (existingTask) {
			throw new Error(`Cannot add task - task already exists with ID ${task.id}`);
		}
	}

	const status = await getStatusInternal(statusOS, task.status);
	if (!status) {
		throw new Error(`Cannot add task with status ID ${task.status} - no such status exists`);
	}

	const request = taskOS.add(task);

	const result = await getIdbRequestPromise(request);
	if (!(typeof result === 'number')) {
		throw new TypeError(`The key for a day should be a number. Received ${JSON.stringify(result, null, '\t')}`);
	}

	return result;
}
