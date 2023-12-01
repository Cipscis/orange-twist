import { daysRegister } from 'data/days/daysRegister';
import { tasksRegister } from 'data/tasks/tasksRegister';
import { dayTasksRegister } from 'data/dayTasks/dayTasksRegister';

/**
 * Clears all data. Primarily useful for clearing data during testing.
 */
export function clear(): void {
	daysRegister.clear();
	tasksRegister.clear();
	dayTasksRegister.clear();
}
