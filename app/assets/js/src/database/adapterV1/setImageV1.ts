import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	addImageInternal,
	getImageInternal,
	updateImageInternal,
} from '../internal';

/**
 * Overwrites information for one image in the database v2, using image information from schema v1.
 */
export async function setImageV1(
	file: Blob,
	hash: string,
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.IMAGE,
	], 'readwrite');

	const existingImage = await getImageInternal(transaction, hash);

	if (existingImage) {
		await updateImageInternal(transaction, {
			file,
			hash,
		});
	} else {
		await addImageInternal(transaction, {
			file,
			hash,
		});
	}
}
