import { toDataUrl } from 'images';

/**
 * Construct a fresh copy of a specified `Blob`.
 *
 * This function is intended as a workaround to a Firefox bug, in which a `Blob` read from a IndexedDB database will become unusable if that database is later deleted.
 *
 * @see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=2033168 Blobs read from an IDB database can't be used after the database is deleted}
 */
export async function copyBlob(blob: Blob): Promise<Blob> {
	const dataUrl = await toDataUrl(blob);
	const response = await fetch(dataUrl);
	const newBlob = await response.blob();
	return newBlob;
}
