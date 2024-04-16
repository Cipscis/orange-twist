import { ls } from 'persist';

import { dayTasksRegister } from '../dayTasksRegister';

/**
 * Save the current day tasks data in memory into persistent storage.
 */
export async function saveDayTasks(): Promise<void> {
	const dayTasksInfo = Array.from(dayTasksRegister.entries());

	await ls.set('day-tasks', dayTasksInfo);
}
