import { tasksRegister } from '../tasksRegister';

/**
 * Save the current tasks data in memory into persistent storage.
 */
export async function saveTasks(): Promise<void> {
	const tasksInfo = Array.from(tasksRegister.entries());

	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	localStorage.setItem('tasks', JSON.stringify(tasksInfo));
}
