import { Register } from 'util/register/Register';

import type { DayTaskInfo } from './types';

/**
 * The {@linkcode Register} containing registration information for all day tasks.
 */
export const dayTasksRegister = new Register<`${string}_${number}`, DayTaskInfo>();
