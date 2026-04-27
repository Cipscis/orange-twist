import type { Sortable } from './Sortable';
import { sortElementsBySortIndex } from './sortElementsBySortIndex';

/**
 * Construct a sorted array of elements with `sortIndex` properties.
 */
export function sortBySortIndex<T extends Sortable>(array: readonly T[]): T[] {
	return array.toSorted(sortElementsBySortIndex);
}
