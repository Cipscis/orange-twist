import { Register } from 'utils';

import type { TaskInfo } from './types';

/**
 * The {@linkcode Register} containing registration information for all tasks.
 */
export const tasksRegister = new Register<number, TaskInfo>();
