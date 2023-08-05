import { getAllDaysData } from '../daysRegister.js';

/**
 * Save data from the days register, excluding empty days.
 */
export async function saveDays(): Promise<void> {
	const daysData = getAllDaysData();

	const daysDataExcludingEmpty = daysData.filter(([dayName, day]) => {
		if (day.note !== '') {
			return true;
		}

		if (day.tasks.length !== 0) {
			return true;
		}

		return false;
	});

	const serialisedDays = JSON.stringify(daysDataExcludingEmpty);

	localStorage.setItem('days', serialisedDays);
}
