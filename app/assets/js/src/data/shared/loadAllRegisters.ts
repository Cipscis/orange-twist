import type { PersistApi } from 'persist';

import { loadDaysRegister } from '../days';
import { loadDayTasksRegister } from '../dayTasks';
import { loadTasksRegister } from '../tasks';
import { loadTemplatesRegister } from '../templates';

/**
 * Load persisted data into each register.
 */
export async function loadAllRegisters(persist: PersistApi): Promise<void> {
	await Promise.all([
		loadDaysRegister(persist),
		loadTasksRegister(persist),
		loadDayTasksRegister(persist),
		loadTemplatesRegister(persist),
	]);
}
