import { useEffect, useState } from 'preact/hooks';

import { Day } from '../../../types/Day.js';

import { AsyncDataState, useAsyncData } from '../../../util/index.js';

import { getDays, loadDaysData } from '../daysRegister.js';
import { onDaysChange, offDaysChange } from '../listeners/onDaysChange.js';

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
	} = useAsyncData(loadDaysData);

	// Try to initialise with existing data
	const [days, setDays] = useState<ReadonlyArray<Day> | null>(() => {
		if (data) {
			return data;
		}

		const days = getDays();
		if (days.length > 0) {
			return days;
		}

		return null;
	});

	// When days are updated, reflect that
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const updateDays = () => {
			const days = getDays();
			setDays(days);
		};

		onDaysChange(updateDays, { signal });

		return () => {
			controller.abort();
		};
	}, []);

	return {
		data: days ?? data,
		isLoading,
		error,
	};
}
