import { type PersistApi } from 'persist';

import { tasksRegister } from '../tasksRegister';

/**
 * Save the current tasks data in memory into persistent storage.
 */
export async function saveTasks(persist: PersistApi): Promise<void> {
	const tasksInfo = Array.from(tasksRegister.entries());

	await persist.set('tasks', tasksInfo);
}
