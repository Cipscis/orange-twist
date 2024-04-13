import { setTemplateInfo, type TemplateInfo } from 'data';
import { templatesRegister } from './templatesRegister';

/**
 * Determines a number that can be used as the unique ID for a new template,
 * based on which IDs have already been used in the templates register.
 *
 * @returns A number that can be used as the unique ID for a new template.
 */
function getNextTemplateId(): number {
	const highestId = Math.max(...templatesRegister.keys());

	// If this is the first template, use 1 as the initial ID
	if (highestId === -Infinity) {
		return 1;
	}

	return highestId + 1;
}

/**
 * Creates a new template with specified initial info, filling in any
 * blanks with default values.
 *
 * @param templateInfo Partial data used to initialise the new template.
 */
export function createTemplate(templateInfo?: Partial<Omit<TemplateInfo, 'id'>>): number {
	const nextTemplateId = getNextTemplateId();

	setTemplateInfo(nextTemplateId, { ...templateInfo });

	return nextTemplateId;
}
