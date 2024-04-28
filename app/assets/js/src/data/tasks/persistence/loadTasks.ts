import { type PersistApi } from 'persist';
import { loadRegister } from 'utils';

import { StorageKey } from 'data/shared';
import { tasksRegister } from '../tasksRegister';
import { updateOldTaskInfo } from '../updateOldTaskInfo';

/**
 * Asynchronously loads any persisted tasks info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when tasks info has finished loading,
 * or rejects when tasks info fails to load.
 */
export async function loadTasks(
	persist: PersistApi,
	serialisedTasksInfo?: string
): Promise<void> {
	const options = serialisedTasksInfo
		? {
			data: serialisedTasksInfo,
		}
		: {
			persist,
			key: StorageKey.TASKS,
		};

	const isValidTaskEntry = (entry: unknown): entry is [number, unknown] => {
		return Array.isArray(entry) &&
		entry.length === 2 &&
		typeof entry[0] === 'number';
	};

	return loadRegister(
		tasksRegister,
		isValidTaskEntry,
		updateOldTaskInfo,
		options,
	);
}
