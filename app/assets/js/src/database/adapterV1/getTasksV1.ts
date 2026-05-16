import type { TaskInfo } from 'data/tasks';

import { getDatabase } from '../utils';
import { getStatuses } from '../getStatuses';
import type { LegacyStatusName } from '../types';
import { ObjectStoreName } from '../metadata';
import { getTasksInternal } from '../internal';

/**
 * Retrieve all schema v1 {@linkcode TaskInfo} information from the database v2.
 */
export async function getTasksV1(): Promise<readonly [number, TaskInfo][]> {
	const tasksV1: TaskInfo[] = [];

	const statuses = await getStatuses();

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TASK,
		ObjectStoreName.STATUS,
	], 'readonly');

	const allTasks = await getTasksInternal(transaction);

	for (const task of allTasks) {
		const taskV1: TaskInfo = {
			id: task.id,
			name: task.name,
			note: task.note,
			sortIndex: task.sortIndex ?? 0,
			// TODO: Make a type safe way of doing this
			status: statuses[task.status].name as LegacyStatusName,
		};

		tasksV1.push(taskV1);
	}

	return tasksV1.map((task) => [task.id, task]);
}
