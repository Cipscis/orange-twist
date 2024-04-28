import { type PersistApi } from 'persist';

import type { Register } from './Register';

/**
 * Save the current days data in memory into persistent storage.
 */
export async function saveRegister<K, V>(
	register: Register<K, V>,
	key: string,
	persist: PersistApi
): Promise<void> {
	const registerEntries = Array.from(register.entries());

	await persist.set(key, registerEntries);
}
