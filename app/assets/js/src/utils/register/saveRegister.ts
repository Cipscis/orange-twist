import { type PersistApi } from 'persist';

import type { Register } from './Register';

/**
 * Asynchronously saves data in a register into persistent storage.
 *
 * @param register - The register to save data from.
 * @param key - The key to use for saving the data to persistent storage.
 * @param persist - The persistence API to use for saving the data to
 * persistent storage.
 *
 * @returns A Promise which resolves when info has finished saving.
 */
export async function saveRegister<K, V>(
	register: Register<K, V>,
	key: string,
	persist: PersistApi
): Promise<void> {
	const registerEntries = Array.from(register.entries());

	await persist.set(key, registerEntries);
}
