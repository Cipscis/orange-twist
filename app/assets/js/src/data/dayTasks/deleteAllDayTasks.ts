import { dayTasksRegister } from './dayTasksRegister';

/**
 * Deletes all day tasks. Primarily useful for clearing data during testing.
 */
export function deleteAllDayTasks(): void {
	dayTasksRegister.clear();
}
