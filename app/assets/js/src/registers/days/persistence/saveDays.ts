import { getAllDaysData } from '../daysRegister.js';

/**
 * Save data from the days register.
 */
export async function saveDays(): Promise<void> {
	const daysData = getAllDaysData();

	localStorage.setItem('days', JSON.stringify(daysData));
}
