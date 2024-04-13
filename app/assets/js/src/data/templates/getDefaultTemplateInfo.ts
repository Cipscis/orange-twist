import type { TemplateInfo } from 'data';

/**
 * Determine default template info, used to fill in any blanks.
 */
export function getDefaultTemplateInfo(taskId: number): Omit<TemplateInfo, 'id'> {
	return {
		name: 'New template',
		template: '',
		sortIndex: -Math.abs(taskId),
	};
}
