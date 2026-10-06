import type { Day } from '../types';
import { ObjectStoreName } from '../metadata';
import { getDayInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single day.
 */
export async function loadDay(id: number): Promise<Day | null> {
	const transaction = await requestTransaction([ObjectStoreName.DAY], 'readonly');

	const day = await getDayInternal(transaction, id);

	return day;
}
