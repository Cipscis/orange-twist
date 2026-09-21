import type { Day } from 'database';

/**
 * Converts a {@linkcode Day} to a user-facing  string describing the day. Currently, this means matching the short variant of the {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601} standard: `YYYY-MM-DD`
 */
export function formatDayName(
	day: Pick<Day, 'year' | 'month' | 'day'>
): string {
	const year = String(day.year).padStart(4, '0');
	const month = String(day.month).padStart(2, '0');
	const date = String(day.day).padStart(2, '0');

	return `${year}-${month}-${date}`;
}
