import { templatesRegister } from './templatesRegister';

/**
 * Delete's all information associated with a template.
 *
 * @param templateName The string specifying the template to delete.
 */
export function deleteTemplate(templateName: string): void {
	templatesRegister.delete(templateName);
}
