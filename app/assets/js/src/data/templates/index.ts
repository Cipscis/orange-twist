export type { TemplateInfo } from './types';

export { setTemplateInfo } from './setTemplateInfo';
export { deleteTemplate } from './deleteTemplate';
export { getTemplateInfo } from './getTemplateInfo';
export { getAllTemplateInfo } from './getAllTemplateInfo';

export {
	useTemplateInfo,
	useAllTemplateInfo,
} from './hooks';

export {
	loadTemplates,
	saveTemplates,
} from './persistence';

