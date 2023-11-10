import { daysRegister } from '../daysRegister';
import { isDayInfo, type DayInfo } from '../types/DayInfo';

export async function loadDays(): Promise<void> {
	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	const serialisedDaysInfo = localStorage.getItem('days');

	if (!serialisedDaysInfo) {
		return;
	}

	const persistedDaysInfo = JSON.parse(serialisedDaysInfo) as unknown;

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
