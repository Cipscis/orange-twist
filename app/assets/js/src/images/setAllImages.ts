import { adapterV1 } from 'database';

/**
 * First, erases all existing images in IndexedDB. Then, adds all
 * images from the `images` parameter.
 */
export async function setAllImages(
	images: readonly (readonly [string, Blob])[]
): Promise<void> {
	await adapterV1.setImages(images);
}
