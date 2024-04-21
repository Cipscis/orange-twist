import { type PersistApi } from 'persist';

import { dayTasksRegister } from '../dayTasksRegister';

/**
 * Save the current day tasks data in memory into persistent storage.
 */
export async function saveDayTasks(persist: PersistApi): Promise<void> {
	const dayTasksInfo = Array.from(dayTasksRegister.entries());

	await persist.set('day-tasks', dayTasksInfo);
}
