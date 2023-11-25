import { useCallback, useEffect, useState } from 'preact/hooks';

import type { DayInfo } from '../types/DayInfo';

import { daysRegister } from '../daysRegister';
import { getAllDayInfo } from '../getAllDayInfo';

/**
 * Provides up to date information on all days.
 */
export function useAllDayInfo(): DayInfo[] {
	// Initialise thisDayInfo based on the passed dayName
	const [thisDayInfo, setThisDayInfo] = useState(() => getAllDayInfo());

	// Update thisDayInfo if dayName changes
	useEffect(() => setThisDayInfo(getAllDayInfo()), []);

	/**
	 * Update the day info if and only if the relevant day has changed.
	 */
	const handleDayInfoUpdate = useCallback((changes: { key: string; }[]) => {
		setThisDayInfo(getAllDayInfo());
		return;
	}, []);

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
