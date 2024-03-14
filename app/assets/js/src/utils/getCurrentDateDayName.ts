import { formatDate } from '../formatters/date';

/**
 * Gets the formatted day name for the current date,
 * with some offset permitted after midnight.
 */
export function getCurrentDateDayName(): string {
	const today = new Date();
	today.setHours(today.getHours() - 3);
	return formatDate(today);
}
