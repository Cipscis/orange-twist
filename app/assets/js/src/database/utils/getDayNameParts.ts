/**
 * Convert a legacy day name into numeric parts. For example, `'2026-04-12'` becomes `[2026, 4, 12]`.
 */
export function getDayNameParts(dayName: string): [number, number, number] {
	const parts = dayName.split('-');
	const year = Number(parts[0]);
	const month = Number(parts[1]);
	const day = Number(parts[2]);

	return [year, month, day];
}
