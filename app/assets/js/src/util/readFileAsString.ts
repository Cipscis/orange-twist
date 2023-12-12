/**
 * Reads a `File` object as a string.
 */
export function readFileAsString(file: File): Promise<string> {
	return (new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
			} else {
				reject(new Error('FileReader result was not a string'));
			}
		});
		reader.addEventListener('error', () => reject(new Error('FileReader encountered an error in reading the selected file')));

		reader.readAsText(file);
	}));
}
