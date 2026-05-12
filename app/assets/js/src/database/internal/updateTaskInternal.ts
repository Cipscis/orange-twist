import {
	getIdbRequestPromise,
	getIterableCursor,
	type ExpandType,
} from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';
import { getStatusInternal } from './getStatusInternal';

export async function updateTaskInternal(
	taskOS: IDBObjectStore,
	statusOS: IDBObjectStore,
	task: ExpandType<
		Pick<DatabaseData[typeof ObjectStoreName.TASK][number], 'id'> &
		Partial<
			Omit<
				DatabaseData[typeof ObjectStoreName.TASK][number],
				'id'
			>
			>
	>
): Promise<void> {
	const requests: Promise<IDBValidKey>[] = [];

	for await (const taskCursor of getIterableCursor(taskOS, task.id)) {
		if (typeof task.status === 'number') {
			const status = await getStatusInternal(statusOS, task.status);
			if (status === null) {
				throw new Error(`Could not apply status ID ${task.status} to task ${task.id} - No such status exists.`);
			}
		}

		requests.push(
			getIdbRequestPromise(
				taskCursor.update({
					...taskCursor.value,
					...task,
				})
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update task ${task.id} - No such task exists.`);
	}

	await Promise.all(requests);
}
