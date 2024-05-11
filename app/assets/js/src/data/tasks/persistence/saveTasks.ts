import { type PersistApi } from 'persist';
import { saveRegister } from 'utils';

import { StorageKey } from 'data/shared';
import { tasksRegister } from '../tasksRegister';

/**
 * Save the current tasks data in memory into persistent storage.
 */
export function saveTasks(persist: PersistApi): Promise<void> {
	return saveRegister(tasksRegister, {
		persist,
		key: StorageKey.TASKS,
	});
}
