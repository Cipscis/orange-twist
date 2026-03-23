import { loadData, type DataSource } from 'data/shared';
import type { Register } from './Register';

/**
 * Asynchronously loads any persisted info from a specified storage
 * location, or specific serialised data, into a specified register.
 * Any data currently in that register will be overwritten.
 *
 * @param register - The register to load data into.
 * @param dataSource - An object containing either serialised data or
 * instructions on how to retrieve data from a storage medium.
 * @param isValidKey - A function to check validity of persisted keys.
 * @param updateOldValue - A function to update, and validate in the process, persisted values.
 *
 * @returns A Promise which resolves when info has finished loading,
 * or rejects when info fails to load.
 */
export async function loadRegister<K, V>(
	register: Register<K, V>,
	dataSource: DataSource,
	isValidEntry: (entry: unknown) => entry is [K, unknown],
	updateOldValue: (value: unknown) => V,
): Promise<void> {
	const persistedData = await loadData(
		dataSource,
		isValidEntry,
		updateOldValue,
	);

	if (typeof persistedData === 'undefined') {
		register.clear();
		return;
	}

	register.clear();
	register.set(persistedData);
}
