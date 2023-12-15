import { TaskStatus } from 'types/TaskStatus';
import type { TaskInfo } from '../types';

/**
 * Determine default task info, used to fill in any blanks.
 */
export function getDefaultTaskInfo(taskId: number): TaskInfo {
	return {
		id: taskId,
		name: 'New task',
		status: TaskStatus.TODO,
		note: '',
		sortIndex: -Math.abs(taskId),
		parent: null,
		children: [],
	};
}
