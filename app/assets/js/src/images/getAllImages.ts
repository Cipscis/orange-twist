import { z } from 'zod';

import {
	getDatabase,
	getEntries,
	ObjectStoreName,
} from 'utils/indexedDB';

const imageDBEntriesSchema = z.array(
	z.tuple([
		z.string(),
		z.instanceof(Blob),
	])
);

/**
 * Retrieve all images saved in the image object store, as [key, value] tuples.
 */
export async function getAllImages(): Promise<[string, Blob][]> {
	// Handle indexedDB not existing in JSDom for tests
	if (!self.indexedDB) {
		return [];
	}

	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGES, 'readonly');
	const objectStore = transaction.objectStore(ObjectStoreName.IMAGES);

	const entriesIterator = getEntries(objectStore);
	const entries = await Array.fromAsync(entriesIterator);
	const parsedEntries = imageDBEntriesSchema.parse(
		entries
	);
	return parsedEntries;
}
