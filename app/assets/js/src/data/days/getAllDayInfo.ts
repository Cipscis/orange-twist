import type { DayInfo } from './types';

import { daysRegister } from './daysRegister';

/**
 * Returns information on every day.
 */
export function getAllDayInfo(): Readonly<DayInfo>[] {
	return Array.from(daysRegister.values());
}
