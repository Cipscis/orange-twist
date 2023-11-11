import { useCallback, useEffect, useState } from 'preact/hooks';

import type { TaskInfo } from '../types/TaskInfo';

import { tasksRegister } from '../tasksRegister';
import { getTaskInfo } from '../getTaskInfo';

/**
 * Provides up to date information on all tasks.
 */
export function useTaskInfo(): TaskInfo[];
/**
 * Provides up to date information on a single task.
 *
 * @param taskId The name of the specified task.
 */
export function useTaskInfo(taskId: number): TaskInfo | null;
export function useTaskInfo(taskId?: number): TaskInfo[] | TaskInfo | null {
	// Initialise thisTaskInfo based on the passed taskId
	const [thisTaskInfo, setThisTaskInfo] = useState(() => getTaskInfo(taskId));

	// Update thisTaskInfo if taskId changes
	useEffect(() => setThisTaskInfo(getTaskInfo(taskId)), [taskId]);

	/**
	 * Update the task info if and only if the relevant task has changed.
	 */
	const handleTaskInfoUpdate = useCallback((changes: { key: number; }[]) => {
		if (typeof taskId === 'undefined') {
			setThisTaskInfo(getTaskInfo());
			return;
		}

		const hasChanged = Boolean(changes.find(({ key }) => key === taskId));
		if (hasChanged) {
			setThisTaskInfo(getTaskInfo(taskId));
		}
	}, [taskId]);

	// Listen for relevant changes on tasksRegister
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		tasksRegister.addEventListener(
			'set',
			handleTaskInfoUpdate,
			{ signal }
		);

		tasksRegister.addEventListener(
			'delete',
			handleTaskInfoUpdate,
			{ signal }
		);

		return () => controller.abort();
	}, [handleTaskInfoUpdate]);

	return thisTaskInfo;
}
