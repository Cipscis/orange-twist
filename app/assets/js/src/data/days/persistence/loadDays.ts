import { daysRegister } from '../daysRegister';
import { isDayInfo, type DayInfo } from '../types/DayInfo';

/**
 * Asynchronously loads any persisted days info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when days info has finished loading,
 * or rejects when days info fails to load.
 */
export async function loadDays(): Promise<void> {
	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	const serialisedDaysInfo = localStorage.getItem('days');

	if (!serialisedDaysInfo) {
		return;
	}

	const persistedDaysInfo = JSON.parse(serialisedDaysInfo) as unknown;

	daysRegister.clear();

	if (!(
		Array.isArray(persistedDaysInfo) &&
		persistedDaysInfo.every((el): el is [string, DayInfo] => {
			return Array.isArray(el) && typeof el[0] === 'string' && isDayInfo(el[1]);
		})
	)) {
		throw new Error(`Persisted days data is invalid: ${serialisedDaysInfo}`);
	}

	daysRegister.set(persistedDaysInfo);
}
