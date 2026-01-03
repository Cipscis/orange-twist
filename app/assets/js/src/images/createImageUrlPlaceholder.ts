// Type-only import to expose symbol for JSDoc
import type { consumeImageUrlPlaceholder } from './consumeImageUrlPlaceholder';

/**
 * Create a string used as a recognisable placeholder for an
 * image URL.
 *
 * @see {@linkcode consumeImageUrlPlaceholder} for how to replace
 * it with an actual URL for an image.
 */
export function createImageUrlPlaceholder(key: string): string {
	return `image:${key}`;
}
