import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import type { TaskInfo } from '../types/TaskInfo';

import { tasksRegister } from '../tasksRegister';
import { getTaskInfo } from '../getTaskInfo';

/**
 * Provides up to date information on a single task.
 *
 * @param taskId The ID of the specified task.
 */
export function useTaskInfo(taskId: number): TaskInfo | null {
	// Initialise thisTaskInfo based on the passed taskIds
	const [thisTaskInfo, setThisTaskInfo] = useState(() => getTaskInfo(taskId));

	const doneInitialRender = useRef(false);

	// Update thisTaskInfo if taskId changes
	useEffect(() => {
		// Don't re-set the state during the initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setThisTaskInfo(getTaskInfo(taskId));
	}, [taskId]);

	/**
	 * Update the task info if and only if the relevant task has changed.
	 */
	const handleTaskInfoUpdate = useCallback((changes: { key: number; }[]) => {
		const hasChanged = (() => {
			return Boolean(changes.find(({ key }) => key === taskId));
		})();

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
