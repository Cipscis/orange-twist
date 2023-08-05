import { isArrayOf } from '@cipscis/ts-toolbox';

import { Day, isDay } from '../../../types/Day.js';

export const isValidDaysData = isArrayOf(
	(el: unknown): el is [string, Day] => {
		if (!Array.isArray(el)) {
			return false;
		}

		if (!(el.length === 2)) {
			return false;
		}

		if (!(typeof el[0] === 'string')) {
			return false;
		}

		if (!(isDay(el[1]))) {
			return false;
		}

		return true;
	}
);

/**
 * Load data for the days register from where it was persisted.
 */
export async function loadDays(): Promise<Array<[string, Day]>> {
	const serialisedDays = localStorage.getItem('days');
	if (serialisedDays === null) {
		return [];
	}

	const persistedDays = JSON.parse(serialisedDays) as unknown;

	if (!isValidDaysData(persistedDays)) {
		throw new TypeError('Invalid days data');
	}

	return persistedDays;
}
