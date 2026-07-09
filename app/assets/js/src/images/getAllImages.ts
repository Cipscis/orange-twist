import { adapterV1 } from 'database';

/**
 * Retrieve all images saved in the image object store, as [key, value] tuples.
 */
export async function getAllImages(): Promise<(readonly [hash: string, image: Blob])[]> {
	return await adapterV1.getImages();
}
