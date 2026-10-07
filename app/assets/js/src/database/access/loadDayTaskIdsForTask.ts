import { ObjectStoreName } from '../metadata';
import { getDayTasksForTaskInternal } from '../internal';

import { requestTransaction } from './requestTransaction';

/**
 * Loads all day task IDs for a given task.
 */
export async function loadDayTaskIdsForTask(
	id: number,
): Promise<readonly number[]> {
	const transaction = await requestTransaction([ObjectStoreName.DAY_TASK], 'readonly');

	const dayTasks = await getDayTasksForTaskInternal(transaction, id);
	const dayTaskIds = dayTasks.map(({ id }) => id);

	return dayTaskIds;
}
