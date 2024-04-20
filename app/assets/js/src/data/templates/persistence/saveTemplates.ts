import { type PersistApi } from 'persist';

import { templatesRegister } from '../templatesRegister';

/**
 * Save the current templates data in memory into persistent storage.
 */
export async function saveTemplates(persist: PersistApi): Promise<void> {
	const templatesInfo = Array.from(templatesRegister.entries());

	return persist.set('templates', templatesInfo);
}
