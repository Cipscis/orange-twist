import type { ExpandType } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

type PartialDay = Pick<
	DatabaseData[typeof ObjectStoreName.DAY][number],
	'year' | 'month' | 'day'
>;

/**
 * Returns a number for use within `Array.toSorted`, used to sort two days chronologically in ascending order.
 */
export function sortDaysChronologically(
	dayA: ExpandType<PartialDay>,
	dayB: ExpandType<PartialDay>,
): number {
	const yearDiff = dayA.year - dayB.year;
	if (yearDiff) {
		return yearDiff;
	}

	const monthDiff = dayA.month - dayB.month;
	if (monthDiff) {
		return monthDiff;
	}

	const dayDiff = dayA.day - dayB.day;
	return dayDiff;
}
