import { type PersistApi } from 'persist';

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
	const persistedTasksInfo = await (() => {
		if (typeof serialisedTasksInfo !== 'undefined') {
			return JSON.parse(serialisedTasksInfo);
		}

		return persist.get('tasks');
	})();

	if (typeof persistedTasksInfo === 'undefined') {
		tasksRegister.clear();
		return;
	}

	if (!(
		Array.isArray(persistedTasksInfo) &&
		persistedTasksInfo.every((el): el is [number, unknown] => (
			Array.isArray(el) &&
			el.length === 2 &&
			typeof el[0] === 'number'
		))
	)) {
		throw new Error(`Persisted tasks data is invalid: ${serialisedTasksInfo}`);
	}

	const newTasksInfo = persistedTasksInfo.map(
		([taskId, taskInfo]) => [taskId, updateOldTaskInfo(taskInfo)] as const
	);

	tasksRegister.clear();
	tasksRegister.set(newTasksInfo);
}
