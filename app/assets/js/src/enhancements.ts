/**
 * @file This file is not render-blocking, but should be kept small
 * so it can be run very early in the page load.
 *
 * It's important that none of its imports include third party
 * libraries, to keep its file size to an absolute minimum.
 */

navigator.serviceWorker?.register('/service-worker.js');
