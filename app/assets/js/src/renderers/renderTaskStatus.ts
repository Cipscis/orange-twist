import { TaskStatus } from '../types/TaskStatus.js';

export function renderTaskStatus(taskStatus: TaskStatus): string {
	return `(${taskStatus})`;
}
