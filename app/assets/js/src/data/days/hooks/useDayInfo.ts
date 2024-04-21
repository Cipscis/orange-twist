import {
	useCallback,
} from 'preact/hooks';

import { useRegister } from 'utils/register';

import type { DayInfo } from '../types/DayInfo';
import { daysRegister } from '../daysRegister';

/**
 * Provides up to date information on a single day.
 *
 * @param dayName The name of the specified day.
 */
export function useDayInfo(dayName: string): DayInfo | null {
	return useRegister(
		daysRegister,
		useCallback((key) => key === dayName, [dayName])
	)[0] ?? null;
}
