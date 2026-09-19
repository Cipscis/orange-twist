import { formatDate } from '../formatters/date';
import { getCurrentDate } from './getCurrentDate';

/**
 * Gets the formatted day name for the current date,
 * with some offset permitted after midnight.
 */
export function getCurrentDateDayName(): string {
	const { year, month, day } = getCurrentDate();
	return formatDate(new Date(year, month-1, day));
}
