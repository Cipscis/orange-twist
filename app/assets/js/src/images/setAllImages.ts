import {
	getDatabase,
	getEntries,
	ObjectStoreName,
} from 'utils/indexedDB';

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
}
