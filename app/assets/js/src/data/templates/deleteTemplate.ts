import { templatesRegister } from './templatesRegister';

/**
 * Deletes all information associated with a template.
 *
 * @param id The ID specifying the template to delete.
 */
export function deleteTemplate(id: number): void {
	templatesRegister.delete(id);
}
