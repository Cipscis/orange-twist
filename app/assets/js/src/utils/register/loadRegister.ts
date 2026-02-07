import type { PersistApi } from 'persist';

import type { Register } from './Register';

type LoadRegisterDataSource = {
	persist: PersistApi;
	key: string;
} | {
	data: string;
};

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
	dataSource: LoadRegisterDataSource,
	isValidEntry: (entry: unknown) => entry is [K, unknown],
	updateOldValue: (value: unknown) => V,
): Promise<void> {
	const persistedInfo = await (() => {
		if ('data' in dataSource) {
			return JSON.parse(dataSource.data);
		}

		return dataSource.persist.get(dataSource.key);
	})();

	if (typeof persistedInfo === 'undefined') {
		register.clear();
		return;
	}

	if (!(
		Array.isArray(persistedInfo) &&
		persistedInfo.every(isValidEntry)
	)) {
		throw new Error(`Persisted data from is invalid: ${JSON.stringify(persistedInfo, null, '\t')}`);
	}

	const newEntries = persistedInfo.map(
		([key, value]) => {
			try {
				return [key, updateOldValue(value)] as const;
			} catch (e) {
				throw new Error(
					`Failed to update value ${JSON.stringify(value, null, '\t')}`,
					{ cause: e }
				);
			}
		}
	);

	register.clear();
	register.set(newEntries);
}
