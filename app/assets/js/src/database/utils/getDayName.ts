import type { ExpandType } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Constructs the string representation of a day used in schema v1, from a day in schema v2.
 */
export function getDayName(day: ExpandType<Pick<
	DatabaseData[typeof ObjectStoreName.DAY][number],
	'year' | 'month' | 'day'
>>): string {
	const year = day.year;
	const month = String(day.month).padStart(2, '0');
	const date = String(day.day).padStart(2, '0');

	return `${year}-${month}-${date}`;
}
