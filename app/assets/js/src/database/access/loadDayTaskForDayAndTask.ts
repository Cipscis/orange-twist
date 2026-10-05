import type { DayTask } from '../types';
import { ObjectStoreName } from '../metadata';
import { getDayTaskForDayAndTaskInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single day task for a specified day and task.
 */
export async function loadDayTaskForDayAndTask(
	{ day, task }: Pick<DayTask, 'day' | 'task'>
): Promise<DayTask | null> {
	const transaction = await requestTransaction([ObjectStoreName.DAY_TASK], 'readonly');

	const dayTask = await getDayTaskForDayAndTaskInternal(transaction, { day, task });

	return dayTask;
}
