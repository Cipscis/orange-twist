import type { Day } from '../types';
import { ObjectStoreName } from '../metadata';
import { getDayByDateInternal } from '../internal';

import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a day at a specified date, or resolves to `null` if no such day exists.
 */
export async function loadDayByDate(date: Pick<Day, 'year' | 'month' | 'day'>): Promise<Day | null> {
	const transaction = await requestTransaction([ObjectStoreName.DAY], 'readonly');

	const day = await getDayByDateInternal(transaction, date);

	return day;
}
