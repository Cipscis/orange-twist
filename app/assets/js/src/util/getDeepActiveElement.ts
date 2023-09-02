/**
 * Returns the current active element, even if it's within Shadow DOM.
 */
export function getDeepActiveElement(root: Document | ShadowRoot = document): Document['activeElement'] {
	const activeElement = root.activeElement;
	if (activeElement?.shadowRoot) {
		return getDeepActiveElement(activeElement.shadowRoot);
	}

	return activeElement;
}
