import {
	useCallback,
} from 'preact/hooks';

import { useRegister } from 'utils/register';

import type { TaskInfo } from '../types/TaskInfo';
import { tasksRegister } from '../tasksRegister';

/**
 * Provides up to date information on a single task.
 *
 * @param taskId The ID of the specified task.
 */
export function useTaskInfo(taskId: number): TaskInfo | null {
	return useRegister(
		tasksRegister,
		useCallback((key) => key === taskId, [taskId])
	)[0] ?? null;
}
