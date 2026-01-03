import { removeDiacritics } from './removeDiacritics';

/**
 * Convert a template name string into a kebab-case that can be
 * used for consuming it in content.
 */
export function getTemplateAlias(templateName: string): string {
	const templateNameLower = templateName.toLocaleLowerCase();
	const templateNameSimple = removeDiacritics(templateNameLower);
	const templateAlias = templateNameSimple
		// Replace any remaining non-word characters with hyphens
		.replace(/\W+/g, '-')
		// Remove any leading or trailing hyphens
		.replace(/^-|-$/g, '');

	return templateAlias;
}
