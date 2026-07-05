import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	addImageInternal,
	getImageInternal,
	getImagesInternal,
	removeImageInternal,
	updateImageInternal,
} from '../internal';

export async function setImagesV1(
	images: readonly (readonly [string, Blob])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.IMAGE,
	], 'readwrite');

	const promises: (Promise<unknown>)[] = [];

	const priorImageHashes = new Set(
		(await getImagesInternal(transaction)).map(({ hash }) => hash)
	);
	const newImageHashes = new Set<string>();

	for (const [hash, file] of images) {
		const existingImage = await getImageInternal(transaction, hash);

		if (existingImage) {
			newImageHashes.add(hash);
			// Update an existing promise
			promises.push(updateImageInternal(transaction, {
				hash,
				file,
			}));
			continue;
		}

		// Create a new image
		const addNewImagePromise = addImageInternal(transaction, {
			hash,
			file,
		});
		addNewImagePromise.then((newImageHash) => newImageHashes.add(newImageHash));
		promises.push(addNewImagePromise);
	}

	// Wait for `newImageHashes` to be fully populated
	await Promise.all(promises);

	// Remove removed images
	const removedImageHashes = priorImageHashes.difference(newImageHashes);

	for (const imageHash of removedImageHashes) {
		promises.push(removeImageInternal(
			transaction,
			imageHash,
		));
	}

	await Promise.all(promises);
}
