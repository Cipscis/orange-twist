import { formatDate } from '../formatters/date';

const pattern = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Checks whether or not a specified date string conforms to the required
 * format of YYYY-MM-DD.
 *
 * @see {@linkcode formatDate}
 */
export function isValidDateString(dateString: string): boolean {
	const parts = dateString.match(pattern);
	if (parts === null) {
		return false;
	}

	const year = parseInt(parts[1], 10);
	const month = parseInt(parts[2], 10) - 1;
	const day = parseInt(parts[3], 10);

	const date = new Date(year, month, day);
	const compareDateString = formatDate(date);

	return dateString === compareDateString;
}
