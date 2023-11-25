import { deleteAllDayTasks } from './dayTasks';
import { deleteAllDays } from './days';
import { deleteAllTasks } from './tasks';

/**
 * Clears all data. Primarily useful for clearing data during testing.
 */
export function clear(): void {
	deleteAllDays();
	deleteAllTasks();
	deleteAllDayTasks();
}
