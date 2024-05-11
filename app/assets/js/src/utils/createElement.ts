/**
 * Create an instance of a specified HTML element, optionally
 * with a group of properties to initialise.
 *
 * @param tagName The name of the element.
 * @param properties An object containing properties to initialise.
 *
 * @example
 * ```typescript
 * const checkboxEl = createElement(
 *     'input',
 *     { type: 'checkbox' }
 * );
 * ```
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, properties?: Partial<HTMLElementTagNameMap[K]>): HTMLElementTagNameMap[K];
/**
 * Create an instance of a specified HTML element, optionally
 * with a group of properties to initialise.
 *
 * @param tagName The name of the element.
 * @param properties An object containing properties to initialise.
 *
 * @example
 * ```typescript
 * const myCustomEl = createElement(
 *     'custom-element',
 *     { className: 'foo' }
 * );
 * ```
 */
export function createElement(tagName: string, properties?: Partial<HTMLElement>): HTMLElement;
export function createElement(tagName: string, properties: Partial<HTMLElement> = {}): HTMLElement {
	return Object.assign(
		document.createElement(tagName),
		properties
	);
}
