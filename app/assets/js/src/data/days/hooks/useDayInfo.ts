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
	// Initialise thisDayInfo based on the passed dayName
	const [thisDayInfo, setThisDayInfo] = useState(() => getDayInfo(dayName));

	// Update thisDayInfo if dayName changes
	useEffect(() => setThisDayInfo(getDayInfo(dayName)), [dayName]);

	/**
	 * Update the day info if and only if the relevant day has changed.
	 */
	const handleDayInfoUpdate = useCallback((changes: { key: string; }[]) => {
		if (typeof dayName === 'undefined') {
			setThisDayInfo(getDayInfo());
			return;
		}

		const hasChanged = Boolean(changes.find(({ key }) => key === dayName));
		if (hasChanged) {
			setThisDayInfo(getDayInfo(dayName));
		}
	}, [dayName]);

	// Listen for relevant changes on daysRegister
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		daysRegister.addEventListener(
			'set',
			handleDayInfoUpdate,
			{ signal }
		);

		daysRegister.addEventListener(
			'delete',
			handleDayInfoUpdate,
			{ signal }
		);

		return () => controller.abort();
	}, [handleDayInfoUpdate]);

	return thisDayInfo;
}
