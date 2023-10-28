/**
 * Converts a `Date` to a string matching the short variant
 * of the {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601}
 * standard: `YYYY-MM-DD`
 */
export function formatDate(date: Date): string {
	if (isNaN(date.getFullYear())) {
		throw new Error('Invalid Date passed to formatDate');
	}

	const year = String(date.getFullYear()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	const dateString = `${year}-${month}-${day}`;

	return dateString;
}
