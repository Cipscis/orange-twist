import { cacheName } from './cacheName';

export async function populateCache(): Promise<void> {
	const cache = await caches.open(cacheName);

	cache.add(new URL('/orange-twist/', self.location.origin));
	cache.add(new URL('/orange-twist/task/', self.location.origin));
}
