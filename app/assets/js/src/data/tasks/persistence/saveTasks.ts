import { ls } from 'persist';

import { tasksRegister } from '../tasksRegister';

/**
 * Save the current tasks data in memory into persistent storage.
 */
export async function saveTasks(): Promise<void> {
	const tasksInfo = Array.from(tasksRegister.entries());

	await ls.set('tasks', tasksInfo);
}
