import { type PersistApi } from 'persist';

import type { Register } from './Register';

interface SaveRegisterDataSource {
	persist: PersistApi;
	key: string;
}

/**
 * Asynchronously saves data in a register into persistent storage.
 *
 * @param register - The register to save data from.
 * @param dataSource - An object containing instructions on how to
 * retrieve data from a storage medium.
 *
 * @returns A Promise which resolves when info has finished saving.
 */
export async function saveRegister<K, V>(
	register: Register<K, V>,
	dataSource: SaveRegisterDataSource,
): Promise<void> {
	const {
		persist,
		key,
	} = dataSource;
	const registerEntries = Array.from(register.entries());

	await persist.set(key, registerEntries);
}
