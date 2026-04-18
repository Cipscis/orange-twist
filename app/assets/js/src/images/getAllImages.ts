import * as z from 'zod/mini';

import {
	getDatabase,
	getEntries,
	ObjectStoreName,
} from 'utils/indexedDB';

const imageDBEntriesSchema = z.array(
	z.tuple([
		z.number(),
		z.object({
			id: z.number(),
			hash: z.string(),
			file: z.instanceof(Blob),
		}),
	])
);

/**
 * Retrieve all images saved in the image object store, as [key, value] tuples.
 */
export async function getAllImages(): Promise<(readonly [string, Blob])[]> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');
	const objectStore = transaction.objectStore(ObjectStoreName.IMAGE);

	const entriesIterator = getEntries(objectStore);
	const entries = await Array.fromAsync(entriesIterator);
	const parsedEntries = imageDBEntriesSchema.parse(
		entries
	).map(([, imageData]) => [imageData.hash, imageData.file] as const);
	return parsedEntries;
}
