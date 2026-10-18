/**
 * Provide a polyfill for {@linkcode Symbol.dispose} if it doesn't exist.
 */
export function initSymbolDisposePolyfill(): void {
	if (typeof Symbol.dispose === 'undefined') {
		// @ts-expect-error Symbol.dispose can't be write-only if it doesn't exist
		Symbol.dispose = Symbol.for('dispose');
	}
}
