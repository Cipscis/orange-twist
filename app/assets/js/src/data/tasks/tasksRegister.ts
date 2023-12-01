import { Register } from 'util/register/Register';

import type { TaskInfo } from './types';

/**
 * The {@linkcode Register} containing registration information for all tasks.
 */
export const tasksRegister = new Register<number, TaskInfo>();
