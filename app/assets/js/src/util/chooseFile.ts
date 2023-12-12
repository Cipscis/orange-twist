/**
 * Prompt the user to select a file, and load it as a `File` object.
 * If the user doesn't select a file, resolves to `null` instead.
 *
 * @param [type] A string to be used for an HTMLInputElement's "accept" attribute
 */
export function chooseFile(type?: string): Promise<File | null> {
	return (new Promise((resolve, reject) => {
		const controller = new AbortController();
		const { signal } = controller;

		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		if (type) {
			fileInput.accept = type;
		}
		fileInput.addEventListener('change', () => {
			controller.abort();
			if (fileInput.files) {
				resolve(fileInput.files[0]);
			} else {
				resolve(null);
			}
		}, {
			once: true,
			signal,
		});
		fileInput.addEventListener('cancel', () => {
			controller.abort();
			resolve(null);
		}, {
			once: true,
			signal,
		});

		fileInput.showPicker();
	}));
}
