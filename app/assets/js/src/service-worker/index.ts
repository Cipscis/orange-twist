/// <reference lib="WebWorker" />

// TODO: I'm not sure why my IDE breaks without that triple slash directive.
// The relevant `tsconfig.json` file already specifies the `WebWorker` lib,
// and the project can compile just fine. But my IDE doesn't seem to understand

import { deleteOldCaches, populateCache } from './cache';
import { cacheFirst, networkFirst } from './strategy';

// TypeScript doesn't have a Service Worker specific library.
// This declaration is necessary to update the types of `self`
// to match the expected environment for a service worker
// https://github.com/microsoft/TypeScript/issues/14877
// https://stackoverflow.com/questions/56356655/structuring-a-typescript-project-with-workers/56374158#56374158
declare const self: ServiceWorkerGlobalScope;
export {};

self.addEventListener('install', (e) => {
	// Trigger the new service worker's activation immediately,
	// even if other tabs are still open using a previous version
	self.skipWaiting();

	e.waitUntil(populateCache());
});

self.addEventListener('activate', (e) => {
	const initialSteps: Promise<void>[] = [
		deleteOldCaches(),
		// If any tabs are still open using a previous version of
		// the service worker, claim them with this new version
		self.clients.claim(),
	];

	if (__IS_DEV__) {
		initialSteps.push(self.registration.navigationPreload.enable());
	}

	e.waitUntil(Promise.all(initialSteps));
});

self.addEventListener('fetch', (e) => {
	if (__IS_DEV__) {
		e.waitUntil((async () => {
			const networkFirstResponse = await networkFirst(e);
			if (networkFirstResponse) {
				e.respondWith(networkFirstResponse);
			}
		})());
	} else {
		e.waitUntil((async () => {
			const cacheFirstResponse = await cacheFirst(e);
			if (cacheFirstResponse) {
				e.respondWith(cacheFirstResponse);
			}
		})());
	}
});
