import { ObjectStoreName } from '../metadata';
import { getDayTasksForTaskInternal, getTaskInternal } from '../internal';

import { requestTransaction } from './requestTransaction';

/**
 * Loads the ID of a task's status.
 *
 * If this task has day tasks, then its status is the status of the furthest future day task. Otherwise, its status is the default status with ID `1`.
 *
 * If no such task exists, returns `null`.
 */
export async function loadStatusForTask(id: number): Promise<number | null> {
	const transaction = await requestTransaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.TASK,
	], 'readonly');

	const taskRequest = getTaskInternal(transaction, id);
	const dayTasksRequest = getDayTasksForTaskInternal(transaction, id);

	if (await taskRequest === null) {
		return null;
	}

	const dayTasks = await dayTasksRequest;
	const lastDayTask = dayTasks.at(-1);
	if (!lastDayTask) {
		// The default status has ID `1`
		return 1;
	}

	return lastDayTask.status;
}
