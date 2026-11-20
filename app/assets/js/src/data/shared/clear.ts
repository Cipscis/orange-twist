import { daysRegister } from '../days/daysRegister';
import { tasksRegister } from '../tasks/tasksRegister';
import { dayTasksRegister } from '../dayTasks/dayTasksRegister';
import { templatesRegister } from '../templates/templatesRegister';

/**
 * Clears all data. Primarily useful for clearing data during testing.
 */
export function clear(): void {
	daysRegister.clear();
	tasksRegister.clear();
	dayTasksRegister.clear();
	templatesRegister.clear();
}
