import { isArrayOf } from '@cipscis/ts-toolbox';

import { Day, isDay } from '../../../types/Day.js';

const isValidDaysData = isArrayOf(
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
export async function loadDays(): Promise<Iterable<[string, Day]> | null> {
	try {
		const serialisedDays = localStorage.getItem('days');
		if (serialisedDays === null) {
			return null;
		}

		const persistedDays = JSON.parse(serialisedDays) as unknown;

		if (!isValidDaysData(persistedDays)) {
			// TODO: Handle error
			console.log('invalid data', persistedDays);
			return null;
		}

		return persistedDays;
	} catch (e) {
		console.error(e);
		return null;
	}
}
