/**
 * Remove diacritics from a string, e.g. 'ā' -> 'a'.
 */
export function removeDiacritics(str: string): string {
	return str
		// Convert to Unicode via canonical decomposition,
		.normalize('NFD')
		// Remove characters in the Combining Diacritical Marks Unicode block
		.replace(/[\u0300-\u036f]/g, '');
}
