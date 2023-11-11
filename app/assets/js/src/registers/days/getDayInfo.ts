import type { DayInfo } from './types';

import { daysRegister } from './daysRegister';

/**
 * Returns information on every day.
 */
export function getDayInfo(): Readonly<DayInfo>[];
/**
 * Returns information for the specified day, if any exists.
 *
 * @param dayName The name of the day to fetch information for.
 */
export function getDayInfo(dayName: string): Readonly<DayInfo> | null;
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function getDayInfo(dayName?: string): Readonly<DayInfo>[] | Readonly<DayInfo> | null
	export function getDayInfo(dayName?: string): Readonly<DayInfo>[] | Readonly<DayInfo> | null {
	if (typeof dayName === 'undefined') {
		return Array.from(daysRegister.values());
	}

	return daysRegister.get(dayName) ?? null;
}
