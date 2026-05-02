import * as z from 'zod/mini';

import {
	getDatabase,
	getEntries,
} from 'utils/indexedDB';

import { getDatabaseVersion } from 'database/utils';
import { ObjectStoreName } from 'database/metadata';
import { adapterV1 } from 'database';

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
export async function getAllImages(): Promise<(readonly [hash: string, image: Blob])[]> {
	const db = await getDatabase();

	// TODO: Get rid of this database v1 handling
	const dbVersion = await getDatabaseVersion();
	if (dbVersion === 1 || dbVersion === null) {
		return await adapterV1.getImages();
	}

	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');
	const objectStore = transaction.objectStore(ObjectStoreName.IMAGE);

	const entriesIterator = getEntries(objectStore);
	const entries = await Array.fromAsync(entriesIterator);
	const parsedEntries = imageDBEntriesSchema.parse(
		entries
	).map(([, imageData]) => [imageData.hash, imageData.file] as const);
	return parsedEntries;
}
