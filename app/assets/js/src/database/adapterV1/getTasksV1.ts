import type { TaskInfo } from 'data/tasks';

import { getDatabase, sortDaysChronologically } from '../utils';
import type { DatabaseData, LegacyStatusName } from '../types';
import { ObjectStoreName } from '../metadata';
import {
	getDaysInternal,
	getDayTasksInternal,
	getStatusesInternal,
	getTasksInternal,
} from '../internal';

/**
 * Retrieve all schema v1 {@linkcode TaskInfo} information from the database v2.
 */
export async function getTasksV1(): Promise<readonly [number, TaskInfo][]> {
	const tasksV1: TaskInfo[] = [];

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TASK,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.DAY,
		ObjectStoreName.STATUS,
	], 'readonly');

	const allTasks = await getTasksInternal(transaction);
	const allDayTasks = await getDayTasksInternal(transaction);
	const allDays = await getDaysInternal(transaction);
	const statuses = await getStatusesInternal(transaction);

	for (const task of allTasks) {
		const status = getStatusForTask({
			task,
			allDayTasks,
			allDays,
			statuses,
		});

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

/**
 * Under schema 1, it was possible for a task to have a status that was not reflected in its last day task. However, under schema 2.0.0 tasks no longer have a status of their own.
 *
 * This function determines if a task has a status mismatch like this and, if it does, it constructs a new last day task with a special note that records the final status.
 */
function getStatusForTask({
	task,
	allDays,
	allDayTasks,
	statuses,
}: {
	task: DatabaseData[typeof ObjectStoreName.TASK][number];
	allDays: DatabaseData[typeof ObjectStoreName.DAY][number][];
	allDayTasks: DatabaseData[typeof ObjectStoreName.DAY_TASK][number][];
	statuses: DatabaseData[typeof ObjectStoreName.STATUS][number][];
}) {
	// Find task status via the task's most recent day task
	const dayTasks = allDayTasks.filter(
		({ task: taskId }) => taskId === task.id
	);
	const sortedDayTasks = dayTasks.toSorted(
		(dayTaskA, dayTaskB) => {
			const dayA = allDays.find(({ id }) => id === dayTaskA.day);
			const dayB = allDays.find(({ id }) => id === dayTaskB.day);

			if (!(dayA && dayB)) {
				throw new Error(`Couldn't find both days ${dayTaskA.day} and ${dayTaskB.day}`);
			}

			return sortDaysChronologically(dayA, dayB);
		}
	);
	const lastDayTask = sortedDayTasks.at(-1);

	// Fall back to the default status at ID 1
	const statusId = lastDayTask?.status ?? 1;

	const status = statuses.find(({ id }) => id === statusId);

	if (!status) {
		throw new Error(`Could not find status with ID ${statusId}`);
	}
	return status;
}
