/**
 * Gets the year, month, and day for the current date, with some offset permitted after midnight.
 */
export function getCurrentDate(): {
	year: number;
	month: number;
	day: number;
} {
	const today = new Date();
	today.setHours(today.getHours() - 3);

	const year = today.getFullYear();
	const month = today.getMonth() + 1;
	const day = today.getDate();

	return { year, month, day };
}
