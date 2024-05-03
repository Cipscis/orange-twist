/**
 * @file This file is not render-blocking, but should be kept small
 * so it can be run very early in the page load.
 *
 * It's important that none of its imports include third party
 * libraries, to keep its file size to an absolute minimum.
 */

if (navigator.serviceWorker) {
	navigator.serviceWorker.register('/service-worker.js');
}

if (__IS_DEV__) {
	/**
	 * Update the document title and favicon to reflect that the app is running in dev mode.
	 */
	const displayDevMode = () => {
		document.title += ' (Next)';

		const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
		if (favicon) {
			favicon.href = '/favicon-dev.svg';
		}
	};

	/**
	 * Add a frames per second display to the UI.
	 */
	const displayFramesPerSecond = () => {
		const fpsEl = Object.assign(
			document.createElement('span'),
			{
				id: 'fps',
				className: 'fps',
			} satisfies Partial<HTMLSpanElement>
		);
		document.body.prepend(fpsEl);

		const fpsTextLowest = Object.assign(
			document.createElement('span'),
			{
				className: 'fps__number fps__lowest',
				innerText: '-',
			} satisfies Partial<HTMLSpanElement>
		);
		const fpsTextCurrent = Object.assign(
			document.createElement('span'),
			{
				className: 'fps__number fps__current',
				innerText: '-',
			} satisfies Partial<HTMLSpanElement>
		);
		fpsEl.append(fpsTextLowest, fpsTextCurrent);

		const fpsLog: number[] = [];

		let previousTime = performance.now();
		const displayFps = (time: number) => {
			const dt = time - previousTime;
			previousTime = time;

			const fps = Math.floor(1000 / dt);
			if (fps <= 0) {
				// Assume this means the tab was inactive, so skip this frame
				requestAnimationFrame(displayFps);
				return;
			}

			fpsLog.push(fps);
			if (fpsLog.length > 120) {
				fpsLog.shift();
			}

			const fpsLowest = Math.min(...fpsLog);
			const fpsLowestString = String(fpsLowest);
			if (fpsTextLowest.innerText !== fpsLowestString) {
				fpsTextLowest.innerText = fpsLowestString;
			}

			const fpsCurrentString = String(fps);
			if (fpsTextCurrent.innerText !== fpsCurrentString) {
				fpsTextCurrent.innerText = fpsCurrentString;
			}

			const isLowFps = fpsLowest < 30;
			fpsEl.classList.toggle('fps--low', isLowFps);

			requestAnimationFrame(displayFps);
		};
		requestAnimationFrame(displayFps);
	};

	displayDevMode();
	displayFramesPerSecond();
}
