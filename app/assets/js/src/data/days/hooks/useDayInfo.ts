import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import type { DayInfo } from '../types/DayInfo';

import { daysRegister } from '../daysRegister';
import { getDayInfo } from '../getDayInfo';

/**
 * Provides up to date information on a single day.
 *
 * @param dayName The name of the specified day.
 */
export function useDayInfo(dayName: string): DayInfo | null {
	// Initialise thisDayInfo based on the passed dayName
	const [thisDayInfo, setThisDayInfo] = useState(() => getDayInfo(dayName));

	const doneInitialRender = useRef(false);

	// Update thisDayInfo if dayName changes
	useEffect(() => {
		// Don't re-set the state during the initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setThisDayInfo(getDayInfo(dayName));
	}, [dayName]);

	/**
	 * Update the day info if and only if the relevant day has changed.
	 */
	const handleDayInfoUpdate = useCallback((changes: { key: string; }[]) => {
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
