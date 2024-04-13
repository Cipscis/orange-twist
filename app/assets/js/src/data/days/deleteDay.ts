import { deleteDayTask } from 'data/dayTasks';
import { daysRegister } from './daysRegister';

/**
 * Deletes all information associated with a day.
 *
 * @param dayName The string specifying the day to delete.
 */
export function deleteDay(dayName: string): void {
	daysRegister.delete(dayName);
	deleteDayTask({ dayName });
}
