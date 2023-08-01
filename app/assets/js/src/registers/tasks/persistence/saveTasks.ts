import { getAllTasksData } from '../tasksRegister.js';

/**
 * Save data from the days register.
 */
export async function saveTasks(): Promise<void> {
	const tasksData = getAllTasksData();

	localStorage.setItem('tasks', JSON.stringify(tasksData));
}
