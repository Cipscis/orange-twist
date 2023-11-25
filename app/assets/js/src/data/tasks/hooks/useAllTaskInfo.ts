import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import type { TaskInfo } from '../types/TaskInfo';

import { tasksRegister } from '../tasksRegister';
import { getTaskInfo } from '../getTaskInfo';
import { getAllTaskInfo } from '../getAllTaskInfo';

/**
 * Provides up to date information on all tasks.
 */
export function useAllTaskInfo(): TaskInfo[];
/**
 * Provides up to date information on multiple tasks.
 *
 * **Important**: You must memoise the array or a new reference will
 * be passed with each render, which will cause an infinite loop.
 *
 * @param taskIds The IDs of the tasks to watch.
 */
export function useAllTaskInfo(taskIds: readonly number[]): (TaskInfo | null)[];
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function useAllTaskInfo(taskIds?: readonly number[]): TaskInfo[] | (TaskInfo | null)[];
export function useAllTaskInfo(taskIds?: readonly number[]): TaskInfo[] | (TaskInfo | null)[] {
	/**
	 * Gets the requested task info, either for all tasks or a limited set.
	 */
	const getThisTaskInfo = useCallback(() => {
		if (Array.isArray(taskIds)) {
			return taskIds.map(getTaskInfo);
		}

		return getAllTaskInfo();
	}, [taskIds]);

	// Initialise thisTaskInfo based on the passed taskIds
	const [thisTaskInfo, setThisTaskInfo] = useState(getThisTaskInfo);

	const doneInitialRender = useRef(false);

	// Update thisTaskInfo if taskId changes
	useEffect(() => {
		// Don't re-set the state during the initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setThisTaskInfo(getThisTaskInfo());
	}, [taskIds, getThisTaskInfo]);

	/**
	 * Update the task info if and only if the relevant task has changed.
	 */
	const handleTaskInfoUpdate = useCallback((changes: { key: number; }[]) => {
		if (typeof taskIds === 'undefined') {
			setThisTaskInfo(getThisTaskInfo());
			return;
		}

		const hasChanged = (() => {
			return Boolean(changes.find(({ key }) => taskIds.indexOf(key) !== -1));
		})();

		if (hasChanged) {
			setThisTaskInfo(getThisTaskInfo());
		}
	}, [taskIds, getThisTaskInfo]);

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
