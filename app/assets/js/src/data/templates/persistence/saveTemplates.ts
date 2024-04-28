import { type PersistApi } from 'persist';
import { saveRegister } from 'utils';

import { templatesRegister } from '../templatesRegister';

/**
 * Save the current templates data in memory into persistent storage.
 */
export async function saveTemplates(persist: PersistApi): Promise<void> {
	return saveRegister(templatesRegister, 'templates', persist);
}
