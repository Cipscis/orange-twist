import { useLayoutEffect, useState } from 'preact/hooks';

import { Day } from '../../../types/Day.js';

import { getDayData } from '../daysRegister.js';
import { onDayChange, offDayChange } from '../listeners/onDayChange.js';

/**
 * A custom hook that provides date information for a specified day.
 */
export function useDay(dayName: string): Readonly<Day> | null {
	const [day, setDay] = useState<Readonly<Day> | null>(() => {
		return getDayData(dayName);
	});

	// `useLayoutEffect` runs synchronously, so this approach works with
	// data being populated synchronously immediately after the initial render
	useLayoutEffect(() => {
		onDayChange(dayName, setDay);

		return () => {
			offDayChange(dayName, setDay);
		};
	});

	return day;
}
