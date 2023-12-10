/**
 * Prompt the user to select a file, and load it as a `File` object.
 * If the user doesn't select a file, this Promise will eventually
 * resolve to `null`, but that resolution may be delayed after the
 * file picker window is closed.
 */
export function chooseFile(): Promise<File | null> {
	return (new Promise((resolve, reject) => {
		const controller = new AbortController();
		const { signal } = controller;

		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'application/json';
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

		fileInput.click();

		// To prevent the event listener keeping the file input in memory if
		// the file picker dialog is cancelled, meaning the change event never
		// fires, make sure it gets cleaned up when the user next clicks on
		// the document after the current event loop has completed
		queueMicrotask(() => {
			document.addEventListener(
				'click',
				(e) => {
					controller.abort();
					resolve(null);
				},
				{
					once: true,
					signal,
				}
			);
		});
	}));
}
