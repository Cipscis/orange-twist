import type { TaskInfo } from 'data/tasks';

import { getDatabase } from '../utils';
import type { LegacyStatusName } from '../types';
import { ObjectStoreName } from '../metadata';
import { getStatusesInternal, getTasksInternal } from '../internal';

/**
 * Retrieve all schema v1 {@linkcode TaskInfo} information from the database v2.
 */
export async function getTasksV1(): Promise<readonly [number, TaskInfo][]> {
	const tasksV1: TaskInfo[] = [];

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TASK,
		ObjectStoreName.STATUS,
	], 'readonly');

	const allTasks = await getTasksInternal(transaction);
	const statuses = await getStatusesInternal(transaction);

	for (const task of allTasks) {
		// This non-null assertion is safe because of other controls around what can be inserted into the database
		const status = statuses.find(({ id }) => id === task.status)!;

		const taskV1: TaskInfo = {
			id: task.id,
			name: task.name,
			note: task.note,
			sortIndex: task.sortIndex ?? 0,
			// This type assertion is safe because statuses are hard-coded to match legacy status names
			status: status.alias as LegacyStatusName,
		};

		tasksV1.push(taskV1);
	}

	return tasksV1.map((task) => [task.id, task]);
}
