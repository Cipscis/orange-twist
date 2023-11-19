import { dayTasksRegister } from '../dayTasksRegister';

/**
 * Save the current day tasks data in memory into persistent storage.
 */
export async function saveDayTasks(): Promise<void> {
	const dayTasksInfo = Array.from(dayTasksRegister.entries());

	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	localStorage.setItem('day-tasks', JSON.stringify(dayTasksInfo));
}
