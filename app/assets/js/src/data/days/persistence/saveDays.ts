import { type PersistApi } from 'persist';
import { saveRegister } from 'utils';

import { daysRegister } from '../daysRegister';

/**
 * Save the current days data in memory into persistent storage.
 */
export function saveDays(persist: PersistApi): Promise<void> {
	return saveRegister(daysRegister, 'days', persist);
}
