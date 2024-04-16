import { ls } from 'persist';

import { daysRegister } from '../daysRegister';
import { updateOldDayInfo } from './updateOldDayInfo';

/**
 * Asynchronously loads any persisted days info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when days info has finished loading,
 * or rejects when days info fails to load.
 */
export async function loadDays(serialisedDaysInfo?: string): Promise<void> {
	const persistedDaysInfo = await (() => {
		if (typeof serialisedDaysInfo !== 'undefined') {
			return JSON.parse(serialisedDaysInfo);
		}

		return ls.get('days');
	})();

	if (persistedDaysInfo === null) {
		daysRegister.clear();
		return;
	}

	if (!(
		Array.isArray(persistedDaysInfo) &&
		persistedDaysInfo.every((el): el is [string, unknown] => (
			Array.isArray(el) &&
			el.length === 2 &&
			typeof el[0] === 'string'
		))
	)) {
		throw new Error(`Persisted days data is invalid: ${serialisedDaysInfo}`);
	}

	const newDaysInfo = persistedDaysInfo.map(
		([dayName, dayInfo]) => [dayName, updateOldDayInfo(dayInfo)] as const
	);

	daysRegister.clear();
	daysRegister.set(newDaysInfo);
}
