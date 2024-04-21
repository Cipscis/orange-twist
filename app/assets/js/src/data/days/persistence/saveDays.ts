import { type PersistApi } from 'persist';

import { daysRegister } from '../daysRegister';

/**
 * Save the current days data in memory into persistent storage.
 */
export async function saveDays(persist: PersistApi): Promise<void> {
	const daysInfo = Array.from(daysRegister.entries());

	await persist.set('days', daysInfo);
}
