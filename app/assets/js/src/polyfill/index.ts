import { initSymbolDisposePolyfill } from './Symbol.dispose';

/**
 * Initialise all defined polyfills.
 */
export function initPolyfills(): void {
	initSymbolDisposePolyfill();
}
