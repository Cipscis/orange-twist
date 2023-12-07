import { useEffect } from 'preact/hooks';

export function useCloseWatcher(callback: () => void, condition?: boolean): void {
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
