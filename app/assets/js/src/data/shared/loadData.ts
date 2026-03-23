import type { DataSource } from './types/DataSource';

/**
 * Load data from a given {@linkcode DataSource} into memory.
 *
 * @throws {TypeError} if persisted data is not valid.
 * @throws {Error} if an error is encountered when updating data.
 *
 * @param dataSource The source of data to load, either a string containing serialised data or a {@link PersistApi} with a key to read from.
 * @param isValidEntryKey A function for checking the validity of loaded entries' keys.
 * @param updateOldValue A function for ensuring loaded entries' values are correct.
 *
 * @returns Loaded data.
 */
export async function loadData<K, V>(
	dataSource: DataSource,
	isValidEntryKey: (entry: unknown) => entry is [K, unknown],
	updateOldValue: (value: unknown) => V,
): Promise<[K, V][] | undefined> {
	const persistedData = await (() => {
		if ('data' in dataSource) {
			return JSON.parse(dataSource.data);
		}

		return dataSource.persist.get(dataSource.key);
	})();

	if (!isValidPersistedData(
		persistedData,
		isValidEntryKey,
	)) {
		throw new TypeError(`Persisted data is invalid: ${JSON.stringify(persistedData, null, '\t')}`);
	}

	if (typeof persistedData === 'undefined') {
		return persistedData;
	}

	const updatedData = updateData(
		persistedData,
		updateOldValue,
	);

	return updatedData;
}

/**
 * Check that persisted data passes a given validity check.
 *
 * Data is considered valid if it is `undefined`, or if it is an array and every member passes `isValidEntry`.
 */
function isValidPersistedData<K>(
	persistedData: unknown,
	isValidEntry: (entry: unknown) => entry is [K, unknown],
): persistedData is undefined | [K, unknown][] {
	if (typeof persistedData === 'undefined') {
		return true;
	}

	if (!Array.isArray(persistedData)) {
		return false;
	}

	return persistedData.every(isValidEntry);
}

/**
 * Updates the values in each entry of an array, with informative error handling.
 */
function updateData<K, V>(
	data: [K, unknown][],
	updateOldValue: (value: unknown) => V,
): [K, V][] {
	const updatedData = data.map(
		([key, value]): [K, V] => {
			try {
				return [key, updateOldValue(value)];
			} catch (e) {
				throw new Error(
					`Failed to update value ${JSON.stringify(value, null, '\t')}`,
					{ cause: e }
				);
			}
		}
	);

	return updatedData;
}
