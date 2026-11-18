import { createImageHash } from 'utils/createImageHash';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	addImageInternal,
	getImageByHashInternal,
	getAllImagesInternal,
	removeImageByHashInternal,
	updateImageInternal,
} from '../internal';

/**
 * Overwrites all image information in the database v2, using image information from schema v1.
 */
export async function setImagesV1(
	images: readonly (readonly [string, Blob])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.IMAGE,
	], 'readwrite');

	const promises: (Promise<unknown>)[] = [];

	const priorImageHashes = new Set(
		(await getAllImagesInternal(transaction)).map(({ hash }) => hash)
	);
	const newImageHashes = new Set<string>();

	for (const [hash, file] of images) {
		const existingImage = await getImageByHashInternal(transaction, hash);

		if (existingImage) {
			// Update an existing image
			newImageHashes.add(hash);
			promises.push(updateImageInternal(transaction, {
				id: existingImage.id,
				hash,
				file,
			}));
			continue;
		}

		// Create a new image
		const addNewImagePromise = addImageInternal(transaction, {
			file,
			hash,
		});
		createImageHash(file).then((newImageHash) => newImageHashes.add(newImageHash));
		promises.push(addNewImagePromise);
	}

	// Wait for `newImageHashes` to be fully populated
	await Promise.all(promises);

	// Remove removed images
	const removedImageHashes = priorImageHashes.difference(newImageHashes);

	for (const imageHash of removedImageHashes) {
		promises.push(removeImageByHashInternal(
			transaction,
			imageHash,
		));
	}

	await Promise.all(promises);
}
