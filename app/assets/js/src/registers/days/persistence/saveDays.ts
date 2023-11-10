import { daysRegister } from '../daysRegister';

/**
 * Save the current days data in memory into persistent storage.
 */
export async function saveDays(): Promise<void> {
	const daysInfo = Array.from(daysRegister.entries());

	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	localStorage.setItem('days', JSON.stringify(daysInfo));
}
