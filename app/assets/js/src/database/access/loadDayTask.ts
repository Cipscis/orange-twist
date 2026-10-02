import type { DayTask } from '../types';
import { ObjectStoreName } from '../metadata';
import { getDayTaskInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single day task.
 */
export async function loadDayTask(id: number): Promise<DayTask | null> {
	const transaction = await requestTransaction([ObjectStoreName.DAY_TASK], 'readonly');

	const dayTask = await getDayTaskInternal(transaction, id);

	return dayTask;
}
