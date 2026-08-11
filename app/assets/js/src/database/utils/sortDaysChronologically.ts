import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Returns a number for use within `Array.toSorted`, used to sort two days chronologically
 */
export function sortDaysChronologically(
	dayA: DatabaseData[typeof ObjectStoreName.DAY][number],
	dayB: DatabaseData[typeof ObjectStoreName.DAY][number],
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
