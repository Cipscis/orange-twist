import type { PersistApi } from 'persist';
import { saveRegister } from 'utils';

import { StorageKey } from 'data/shared';
import { templatesRegister } from '../templatesRegister';

/**
 * Save the current templates data in memory into persistent storage.
 */
export async function saveTemplates(persist: PersistApi): Promise<void> {
	return saveRegister(templatesRegister, {
		persist,
		key: StorageKey.TEMPLATES,
	});
}
