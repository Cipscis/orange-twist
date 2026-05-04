import { getEntries } from 'utils';

import { ObjectStoreName } from 'database/metadata';
import { getDatabase, getDatabaseVersion } from 'database/utils';

/**
 * First, erases all existing images in IndexedDB. Then, adds all
 * images from the `images` parameter.
 */
export async function setAllImages(
	images: readonly (readonly [string, Blob])[]
): Promise<void> {
	// Handle indexedDB not existing in JSDom for tests
	if (!self.indexedDB) {
		return;
	}

	// TODO: Get rid of this database v1 handling
	const dbVersion = await getDatabaseVersion();
	if (dbVersion === 1 || dbVersion === null) {
		// In the same database transaction, delete all images then set all images
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.IMAGES, 'readwrite');
		const objectStore = transaction.objectStore(ObjectStoreName.IMAGES);

		const entries = getEntries(objectStore);
		for await (const [key] of entries) {
			objectStore.delete(key);
		}

		for (const [key, imageBlob] of images) {
			objectStore.add(imageBlob, key);
		}

		return;
	}

	// TODO: Implement v2 handling
	throw new Error('Saving image not implemented');
}
