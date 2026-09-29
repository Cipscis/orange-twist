import { getCurrentDate } from 'utils';

import type { Day } from '../types';

import { save } from './save';
import { SaveType } from './SaveAction';

import { loadDayByDate } from './loadDayByDate';

/**
 * Loads the current day. If it doesn't already exist, it will be created.
 */
export async function loadCurrentDay(): Promise<Day> {
	const currentDate = getCurrentDate();
	let currentDay = await loadDayByDate(currentDate);

	// If today already exists, provide it right away
	if (currentDay) {
		return currentDay;
	}

	// Otherwise, create today then retrieve it again
	// Calling `save` directly avoids displaying a "Saved" alert
	await save([{
		type: SaveType.DAY_ADD,
		day: {
			...currentDate,
			note: '',
		},
	}]);

	currentDay = await loadDayByDate(currentDate);

	if (!currentDay) {
		throw new Error('Something went wrong with creating the current day');
	}

	return currentDay;
}
