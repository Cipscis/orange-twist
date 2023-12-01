import type { DayInfo } from './types';

import { daysRegister } from './daysRegister';

/**
 * Returns information for the specified day, if any exists.
 *
 * @param dayName The name of the day to fetch information for.
 */
export function getDayInfo(dayName: string): Readonly<DayInfo> | null {
	return daysRegister.get(dayName) ?? null;
}
