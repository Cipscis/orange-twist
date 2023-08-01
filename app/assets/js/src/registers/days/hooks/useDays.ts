import { useLayoutEffect, useState } from 'preact/hooks';

import { Day } from '../../../types/Day.js';
import { getDays } from '../daysRegister.js';
import { onDaysChange, offDaysChange } from '../listeners/onDaysChange.js';

/**
 * A custom hook that provides data for each day.
 */
export function useDays(): ReadonlyArray<Readonly<Readonly<Day>>> {
	const [days, setDays] = useState<ReadonlyArray<Readonly<Day>>>(getDays);

	// `useLayoutEffect` runs synchronously, so this approach works with
	// data being populated synchronously immediately after the initial render
	useLayoutEffect(() => {
		onDaysChange(setDays);

		return (() => {
			offDaysChange(setDays);
		});
	});

	return days;
}
