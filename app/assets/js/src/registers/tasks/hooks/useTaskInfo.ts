import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

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
 * @param taskId The ID of the specified task.
 */
export function useTaskInfo(taskId: number): TaskInfo | null;
/**
 * Provides up to date information on multiple tasks.
 *
 * **Important**: You must memoise the array or a new reference will
 * be passed with each render, which will cause an infinite loop.
 *
 * @param taskIds The IDs of the tasks to watch.
 */
export function useTaskInfo(taskIds: number[]): (TaskInfo | null)[];
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function useTaskInfo(taskIdsArg?: number | number[]): TaskInfo[] | TaskInfo | null | (TaskInfo | null)[];
export function useTaskInfo(taskIdsArg?: number | number[]): TaskInfo[] | TaskInfo | null | (TaskInfo | null)[] {
	// First, consolidate arguments
	const taskIds = useMemo(() => {
		if (Array.isArray(taskIdsArg)) {
			return taskIdsArg;
		}

		return taskIdsArg;
	}, [taskIdsArg]);

	// Initialise thisTaskInfo based on the passed taskIds
	const [thisTaskInfo, setThisTaskInfo] = useState(() => {
		if (Array.isArray(taskIds)) {
			return taskIds.map((taskId) => getTaskInfo(taskId));
		}

		return getTaskInfo(taskIds);
	});

	const doneInitialRender = useRef(false);

	// Update thisTaskInfo if taskId changes
	useEffect(() => {
		// Don't re-set the state during the initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setThisTaskInfo(getTaskInfo(taskIds));
	}, [taskIds]);

	/**
	 * Update the task info if and only if the relevant task has changed.
	 */
	const handleTaskInfoUpdate = useCallback((changes: { key: number; }[]) => {
		if (typeof taskIds === 'undefined') {
			setThisTaskInfo(getTaskInfo());
			return;
		}

		const hasChanged = (() => {
			if (typeof taskIds === 'number') {
				return Boolean(changes.find(({ key }) => key === taskIds));
			}

			return Boolean(changes.find(({ key }) => taskIds.indexOf(key) !== -1));
		})();

		if (hasChanged) {
			setThisTaskInfo(getTaskInfo(taskIds));
		}
	}, [taskIds]);

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
