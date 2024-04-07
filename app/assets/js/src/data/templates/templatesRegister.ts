import { Register } from 'utils';

import type { TemplateInfo } from './types';

/**
 * The {@linkcode Register} containing registration information for all templates.
 */
export const templatesRegister = new Register<number, TemplateInfo>();
