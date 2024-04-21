import {
	useCallback,
} from 'preact/hooks';

import { useRegister } from 'utils/register';

import type { DayInfo } from '../types/DayInfo';
import { daysRegister } from '../daysRegister';

/**
 * Provides up to date information on all days.
 */
export function useAllDayInfo(): readonly DayInfo[] {
	return useRegister(
		daysRegister,
		useCallback(() => true, [])
	);
}
