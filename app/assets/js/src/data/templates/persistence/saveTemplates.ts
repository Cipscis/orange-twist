import { templatesRegister } from '../templatesRegister';

/**
 * Save the current templates data in memory into persistent storage.
 */
export async function saveTemplates(): Promise<void> {
	const templatesInfo = Array.from(templatesRegister.entries());

	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	localStorage.setItem('templates', JSON.stringify(templatesInfo));
}
