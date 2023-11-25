import { tasksRegister } from './tasksRegister';

/**
 * Deletes all tasks. Primarily useful for clearing data during testing.
 */
export function deleteAllTasks(): void {
	tasksRegister.clear();
}
