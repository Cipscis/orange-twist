import { tasksRegister } from '../tasksRegister';
import { isTaskInfo, type TaskInfo } from '../types/TaskInfo';

export async function loadTasks(): Promise<void> {
	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	const serialisedTasksInfo = localStorage.getItem('tasks');

	if (!serialisedTasksInfo) {
		return;
	}

	const persistedTasksInfo = JSON.parse(serialisedTasksInfo) as unknown;

	tasksRegister.clear();

	if (!(
		Array.isArray(persistedTasksInfo) &&
		persistedTasksInfo.every((el): el is [number, TaskInfo] => {
			return Array.isArray(el) && typeof el[0] === 'number' && isTaskInfo(el[1]);
		})
	)) {
		throw new Error(`Persisted tasks data is invalid: ${serialisedTasksInfo}`);
	}

	tasksRegister.set(persistedTasksInfo);
}
