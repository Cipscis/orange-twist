import { ls } from 'persist';

import { daysRegister } from '../daysRegister';

/**
 * Save the current days data in memory into persistent storage.
 */
export async function saveDays(): Promise<void> {
	const daysInfo = Array.from(daysRegister.entries());

	await ls.set('days', daysInfo);
}
