import { getDatabaseVersion } from 'database/utils';
import { adapterV1, getImages } from 'database';

/**
 * Retrieve all images saved in the image object store, as [key, value] tuples.
 */
export async function getAllImages(): Promise<(readonly [hash: string, image: Blob])[]> {
	// TODO: Get rid of this database v1 handling
	const dbVersion = await getDatabaseVersion();
	if (dbVersion === 1 || dbVersion === null) {
		return await adapterV1.getImages();
	}

	const images = await getImages();

	return images.map(({ hash, file }) => [hash, file]);
}
