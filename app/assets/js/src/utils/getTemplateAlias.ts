/**
 * Convert a template name string into a kebab-case that can be
 * used for consuming it in content.
 */
export function getTemplateAlias(templateName: string): string {
	return templateName.toLocaleLowerCase()
		// Convert to Unicode via canonical decomposition,
		.normalize('NFD')
		// Remove characters in the Combining Diacritical Marks Unicode block
		.replace(/[\u0300-\u036f]/g, '')
		// Replace any remaining non-word characters with hyphens
		.replace(/\W+/g, '-');
}
