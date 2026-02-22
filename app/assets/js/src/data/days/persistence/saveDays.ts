import type { PersistApi } from 'persist';
import { saveRegister } from 'utils';

import { StorageKey } from 'data/shared';
import { daysRegister } from '../daysRegister';

/**
 * Save the current days data in memory into persistent storage.
 */
export function saveDays(persist: PersistApi): Promise<void> {
	return saveRegister(daysRegister, {
		persist,
		key: StorageKey.DAYS,
	});
}
