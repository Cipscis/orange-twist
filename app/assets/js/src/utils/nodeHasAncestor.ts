/**
 * Checks if a specified node has a specified ancestor.
 */
export function nodeHasAncestor(node: Node, ancestor: Node): boolean {
	let cursor = node.parentElement;
	while (cursor) {
		if (cursor === ancestor) {
			return true;
		}
		cursor = cursor.parentElement;
	}

	return false;
}
