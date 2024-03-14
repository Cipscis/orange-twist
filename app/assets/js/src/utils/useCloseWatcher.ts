import { useEffect } from 'preact/hooks';

/**
 * Configure a callback to be called when a UI component should be closed.
 * If supported, this will use the
 * [`CloseWatcher`](https://html.spec.whatwg.org/multipage/interaction.html#the-closewatcher-interface)
 * API. Otherwise, an event listener will be set up for the "Escape" key.
 *
 * @param callback The function that should be called to close the UI component.
 * @param condition Whether or not the UI component is currently open.
 */
export function useCloseWatcher(callback: () => void, condition: boolean): void {
	useEffect(() => {
		if (condition === false) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		if (window.CloseWatcher) {
			const watcher = new window.CloseWatcher({ signal });
			watcher.addEventListener('close', () => callback());
		} else {
			document.addEventListener(
				'keydown',
				(e) => {
					if (e.key === 'Escape') {
						callback();
					}
				},
				{ signal }
			);
		}

		return () => {
			controller.abort();
		};
	}, [condition, callback]);
}
