import { daysRegister } from './daysRegister';

/**
 * Delete's all information associated with a day.
 *
 * @param dayName The string specifying the day to delete.
 */
export function deleteDayInfo(dayName: string): void {
	daysRegister.delete(dayName);
}
