import { useCallback, useEffect, useState } from 'preact/hooks';

import type { DayInfo } from '../types/DayInfo';

import { daysRegister } from '../daysRegister';
import { getDayInfo } from '../getDayInfo';

/**
 * Provides up to date information on all days.
 */
export function useDayInfo(): DayInfo[];
/**
 * Provides up to date information on a single day.
 *
 * @param dayName The name of the specified day.
 */
export function useDayInfo(dayName: string): DayInfo | null;
export function useDayInfo(dayName?: string): DayInfo[] | DayInfo | null {
	const getThisDayInfo = useCallback(() => {
		if (dayName) {
			return getDayInfo(dayName);
		} else {
			return getDayInfo();
		}
	}, [dayName]);

	const [dayInfo, setDayInfo] = useState(getThisDayInfo);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		daysRegister.addEventListener(
			'set',
			() => setDayInfo(getThisDayInfo()),
			{ signal }
		);

		daysRegister.addEventListener(
			'delete',
			() => setDayInfo(getThisDayInfo()),
			{ signal }
		);

		return () => controller.abort();
	}, [getThisDayInfo]);

	return dayInfo;
}
