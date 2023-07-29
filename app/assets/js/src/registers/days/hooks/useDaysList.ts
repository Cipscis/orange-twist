import { useLayoutEffect, useState } from 'preact/hooks';

import { getDaysList } from '../daysRegister.js';
import { onDaysListChange, offDaysListChange } from '../listeners/onDaysListChange.js';

/**
 * A custom hook that provides the list of days with associated data.
 */
export function useDaysList(): ReadonlyArray<string> {
	const [daysList, setDaysList] = useState<ReadonlyArray<string>>(() => {
		return getDaysList();
	});

	// `useLayoutEffect` runs synchronously, so this approach works with
	// data being populated synchronously immediately after the initial render
	useLayoutEffect(() => {
		onDaysListChange(setDaysList);

		return (() => {
			offDaysListChange(setDaysList);
		});
	});

	return daysList;
}
