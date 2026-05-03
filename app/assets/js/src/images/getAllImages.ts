import { getEntries } from 'utils/indexedDB';

import { adapterV1 } from 'database';
import { getDatabase, getDatabaseVersion } from 'database/utils';
import { ObjectStoreName } from 'database/metadata';

/**
 * Retrieve all images saved in the image object store, as [key, value] tuples.
 */
export async function getAllImages(): Promise<(readonly [hash: string, image: Blob])[]> {
	// TODO: Get rid of this database v1 handling
	const dbVersion = await getDatabaseVersion();
	if (dbVersion === 1 || dbVersion === null) {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.IMAGES, 'readonly');
		const imageOS = transaction.objectStore(ObjectStoreName.IMAGES);

		const entries = await Array.fromAsync(getEntries(imageOS));
		return entries as [string, Blob][];
	}

	return await adapterV1.getImages();
}
