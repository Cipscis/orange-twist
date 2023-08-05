import { useEffect, useState } from 'preact/hooks';

import { Day } from '../../../types/Day.js';

import { AsyncDataState, useAsyncData } from '../../../util/useAsyncData.js';

import { getDays, loadDayData } from '../daysRegister.js';
import { offDaysChange, onDaysChange } from '../listeners/onDaysChange.js';

/**
 * Load persisted days data if necessary, exposing loading and error states related to that process.
 *
 * Once days data is loaded, expose days data and keep it up to date.
 */
export function useDays(): AsyncDataState<ReadonlyArray<Readonly<Day>>> {
	const {
		data,
		isLoading,
		error,
	} = useAsyncData(loadDayData);

	// Try to initialise with existing data
	const [days, setDays] = useState<ReadonlyArray<Day> | null>(() => {
		if (data) {
			return data;
		}

		const days = getDays();
		if (days.length) {
			return days;
		}

		return null;
	});

	// When data becomes available, expose it
	useEffect(() => {
		setDays(data);
	}, [data]);

	// When days are updated, reflect that
	useEffect(() => {
		const updateDays = () => {
			const days = getDays();
			setDays(days);
		};

		onDaysChange(updateDays);

		return () => {
			offDaysChange(updateDays);
		};
	}, []);

	return {
		data: days,
		isLoading,
		error,
	};
}
