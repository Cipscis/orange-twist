import * as z from 'zod/mini';

import {
	getDatabase,
	getEntries,
} from 'utils/indexedDB';

import { getDatabaseVersion } from 'database/utils';
import { ObjectStoreName } from 'database/metadata';

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

	// TODO: Get rid of this database v1 handling
	const dbVersion = await getDatabaseVersion();
	if (dbVersion === 1 || dbVersion === null) {
		const transaction = db.transaction(ObjectStoreName.IMAGES, 'readonly');
		const objectStore = transaction.objectStore(ObjectStoreName.IMAGES);

		const entriesIterator = getEntries(objectStore);
		const entries = await Array.fromAsync(entriesIterator);
		const parsedEntries = z.array(
			z.tuple([z.string(), z.instanceof(Blob)])
		).parse(
			entries
		);
		return parsedEntries;
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
