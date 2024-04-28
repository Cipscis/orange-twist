import { type PersistApi } from 'persist';
import { loadRegister } from 'utils';

import { StorageKey } from 'data/shared';
import { daysRegister } from '../daysRegister';
import { updateOldDayInfo } from './updateOldDayInfo';

/**
 * Asynchronously loads any persisted days info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when days info has finished loading,
 * or rejects when days info fails to load.
 */
export async function loadDays(
	persist: PersistApi,
	serialisedDaysInfo?: string
): Promise<void> {
	const options = serialisedDaysInfo
		? {
			data: serialisedDaysInfo,
		}
		: {
			persist,
			key: StorageKey.DAYS,
		};

	const isValidDayEntry = (entry: unknown): entry is [string, unknown] => {
		return Array.isArray(entry) &&
		entry.length === 2 &&
		typeof entry[0] === 'string';
	};

	return loadRegister(
		daysRegister,
		isValidDayEntry,
		updateOldDayInfo,
		options
	);
}
