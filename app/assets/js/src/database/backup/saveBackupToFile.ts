import { getCurrentDateDayName } from 'utils/getCurrentDateDayName';

import { toDataUrl } from 'images';

import type { TaggedVersionedDatabaseData } from '../types';
import { updateData } from '../migration';

/**
 * Save a {@linkcode TaggedVersionedDatabaseData} to a file.
 */
export async function saveBackupToFile(
	data: TaggedVersionedDatabaseData
): Promise<void> {
	const updatedData = await updateData(data);

	// Replace all image Blobs with data URLs for serialisation
	// Data URLs calculated ahead of time for synchronous replacement in JSON.stringify
	const dataUrls = new WeakMap<Blob, string>();
	const promises: Promise<void>[] = [];
	for (const [, image] of Object.entries(updatedData.image)) {
		const { file } = updatedData.image[image.id];
		promises.push(
			toDataUrl(file).then((url) => {
				dataUrls.set(file, url);
			})
		);
		dataUrls.set(file, await toDataUrl(file));
	}
	await Promise.all(promises);

	const blob = new Blob(
		[JSON.stringify(updatedData, (key, value) => {
			if (key === 'file' && value instanceof Blob) {
				return dataUrls.get(value);
			}

			return value as unknown;
		})],
		{ type: 'application/json' }
	);

	const dataUrl = URL.createObjectURL(blob);

	const downloadLink = document.createElement('a');
	downloadLink.href = dataUrl;
	downloadLink.download = `orange-twist-export-${getCurrentDateDayName()}`;
	downloadLink.click();

	URL.revokeObjectURL(dataUrl);
}
