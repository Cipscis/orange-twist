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
	document.title += ' (Next)';

	const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
	if (favicon) {
		favicon.href = '/favicon-dev.svg';
	}
}
