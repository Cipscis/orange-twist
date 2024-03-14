/**
 * Use `window.requestAnimationFrame` to wait for the next
 * frame, allowing the browser to repaint etc.
 */
export function nextFrame(): Promise<void> {
	return new Promise((resolve) => {
		// Chrome (and perhaps other browsers) require a "double RAF" to ensure a frame has passed
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => resolve());
		});
	});
}
