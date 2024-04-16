import { ls } from 'persist';

import { templatesRegister } from '../templatesRegister';

/**
 * Save the current templates data in memory into persistent storage.
 */
export async function saveTemplates(): Promise<void> {
	const templatesInfo = Array.from(templatesRegister.entries());

	return ls.set('templates', templatesInfo);
}
