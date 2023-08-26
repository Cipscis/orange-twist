/**
 * Checks if a specified element has a specified ancestor.
 */
export function elementHasAncestor(element: Node, ancestor: Node): boolean {
	let cursor = element.parentElement;
	while (cursor) {
		if (cursor === ancestor) {
			return true;
		}
		cursor = cursor.parentElement;
	}

	return false;
}
