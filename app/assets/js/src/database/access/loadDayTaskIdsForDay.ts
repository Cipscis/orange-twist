import { ObjectStoreName } from '../metadata';
import { getDayTasksForDayInternal } from '../internal';

import { requestTransaction } from './requestTransaction';

/**
 * Loads all day task IDs for a given day.
 */
export async function loadDayTaskIdsForDay(
	id: number,
): Promise<readonly number[]> {
	const transaction = await requestTransaction([ObjectStoreName.DAY_TASK], 'readonly');

	const dayTasks = await getDayTasksForDayInternal(transaction, id);
	const dayTaskIds = dayTasks.map(({ id }) => id);

	return dayTaskIds;
}
