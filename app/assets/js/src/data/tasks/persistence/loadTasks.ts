import { tasksRegister } from '../tasksRegister';
import { updateOldTaskInfo } from '../updateOldTaskInfo';

/**
 * Asynchronously loads any persisted tasks info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when tasks info has finished loading,
 * or rejects when tasks info fails to load.
 */
export async function loadTasks(serialisedTasksInfo?: string): Promise<void> {
	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	if (typeof serialisedTasksInfo === 'undefined') {
		serialisedTasksInfo = localStorage.getItem('tasks') ?? undefined;
	}

	if (!serialisedTasksInfo) {
		tasksRegister.clear();
		return;
	}

	const persistedTasksInfo = JSON.parse(serialisedTasksInfo);

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
