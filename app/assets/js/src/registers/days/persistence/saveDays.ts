import { getAllDayData } from '../daysRegister.js';

/**
 * Save data from the days register.
 */
export async function saveDays(): Promise<void> {
	const daysData = getAllDayData();

	localStorage.setItem('days', JSON.stringify(daysData));
}
