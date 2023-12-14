import { cacheName } from './cacheName';

/**
 * Delete all caches that we don't want to keep
 */
export async function deleteOldCaches(): Promise<void> {
	const keys = await caches.keys();
	const cachesToKeep = [cacheName];
	const cachesToDelete = keys.filter(
		(key) => cachesToKeep.includes(key) === false
	);

	await Promise.all(cachesToDelete.map((key) => caches.delete(key)));
}
