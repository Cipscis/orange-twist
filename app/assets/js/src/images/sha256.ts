/**
 * Calculate the SHA-256 hash of a specified Blob, and return it
 * as a hexadecimal string.
 */
export async function sha256(data: Blob): Promise<string> {
	const dataAsBuffer = await data.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest('SHA-256', dataAsBuffer);

	const hashHexBuffer = new Uint8Array(hashBuffer);
	const hashHexString = Array.from(hashHexBuffer)
		.map((num) =>
			num.toString(16)
				.padStart(2, '0'))
		.join('');

	return hashHexString;
}
