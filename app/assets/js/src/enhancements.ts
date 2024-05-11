/**
 * @file This file is not render-blocking, but should be kept small
 * so it can be run very early in the page load.
 *
 * It's important that none of its imports include third party
 * libraries, to keep its file size to an absolute minimum.
 */

import { FpsCounter } from 'dev/fps-counter';
import { createElement } from 'utils';

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
		customElements.define('fps-counter', FpsCounter);
		const fpsEl = createElement(
			'fps-counter',
			{
				className: 'fps',
			}
		);
		document.body.prepend(fpsEl);
	};

	displayDevMode();
	if (__SHOW_FPS_COUNTER__) {
		displayFramesPerSecond();
	}
}
