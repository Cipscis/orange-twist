import { sha256 } from './sha256';

/**
 * Create a hash used to identify an image.
 *
 * @param image - The image to construct a has for.
 *
 * @returns A `Promise` that resolves to an 8 digit truncated
 * SHA-256 hash result in hexadecimal.
 */
export async function createImageHash(image: Blob): Promise<string> {
	const hash = await sha256(image);
	const truncatedHash = hash.slice(0, 8);
	return truncatedHash;
}
