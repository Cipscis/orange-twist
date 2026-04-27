import type { Sortable } from './Sortable';

/**
 * Sort two individual items with `sortIndex` properties.
 */
export function sortElementsBySortIndex<T extends Sortable>(
	{ sortIndex: a }: T,
	{ sortIndex: b }: T,
): number {
	if (a === b) {
		return 0;
	}

	return (a ?? -Infinity) - (b ?? -Infinity);
}
