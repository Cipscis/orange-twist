import { type PersistApi } from 'persist';
import { saveRegister } from 'utils';

import { StorageKey } from 'data/shared';
import { dayTasksRegister } from '../dayTasksRegister';

/**
 * Save the current day tasks data in memory into persistent storage.
 */
export function saveDayTasks(persist: PersistApi): Promise<void> {
	return saveRegister(dayTasksRegister, StorageKey.DAY_TASKS, persist);
}
