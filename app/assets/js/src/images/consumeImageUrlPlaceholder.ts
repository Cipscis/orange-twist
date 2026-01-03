// Type-only import to expose symbol for JSDoc
import type { createImageUrlPlaceholder } from './createImageUrlPlaceholder';
import { getImage } from './getImage';

/**
 * A Map for keeping track of object URLs constructed for images.
 */
const objectUrls = new Map<string, string>();

/**
 * Convert an image URL placeholder string into an actual
 * URL for an image.
 *
 * @see {@linkcode createImageUrlPlaceholder} for creating
 * a placeholder URL for an image.
 */
export async function consumeImageUrlPlaceholder(hash: string): Promise<string> {
	const existingUrl = objectUrls.get(hash);

	if (existingUrl) {
		return existingUrl;
	}

	const image = await getImage(hash);
	if (!image) {
		throw new Error(`Could not find an image with the hash ${hash}`);
	}

	const objectUrl = URL.createObjectURL(image);
	objectUrls.set(hash, objectUrl);
	return objectUrl;
}
