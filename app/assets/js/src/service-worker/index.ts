/// <reference lib="WebWorker" />

import { deleteOldCaches, populateCache } from './cache';
import { networkFirst } from './strategy';

// TODO: I'm not sure why my IDE breaks without that triple slash directive.
// The `tsconfig.workers.json` file already specifies the `WebWorker` lib,
// and the project can compile just fine. But my IDE doesn't seem to understand

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
	e.waitUntil(Promise.all([
		self.registration.navigationPreload.enable(),
		deleteOldCaches(),
		// If any tabs are still open using a previous version of
		// the service worker, claim them with this new version
		self.clients.claim(),
	]));
});

self.addEventListener('fetch', (e) => {
	e.respondWith(networkFirst(e));
});
