/**
 * Escapes a string that may contain characters with special
 * meanings when used in the `RegExp` constructor.
 */
export function escapeRegExpString(str: string): string {
	return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}
