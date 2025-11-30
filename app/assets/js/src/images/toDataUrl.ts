/**
 * Convert an image `Blob` to a data URL.
 */
export function toDataUrl(image: Blob): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('loadend', () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
			} else {
				reject(new Error('FileReader result for readAsDataURL operation was not a string.'));
			}
		});
		reader.addEventListener('error', () => reject(
			reader.error ??
			new Error('FileReader encountered an unrecognised error.')
		));

		reader.readAsDataURL(image);
	});
}
