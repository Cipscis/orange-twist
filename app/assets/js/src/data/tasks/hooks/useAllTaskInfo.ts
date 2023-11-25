import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import type { TaskInfo } from '../types/TaskInfo';

import { tasksRegister } from '../tasksRegister';
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
export function useAllTaskInfo(taskIds: readonly number[]): TaskInfo[];
export function useAllTaskInfo(matcher: (task: TaskInfo) => boolean): TaskInfo[];
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function useAllTaskInfo(taskIds?: readonly number[]): TaskInfo[];
export function useAllTaskInfo(
	matcherArg?: readonly number[] | ((task: TaskInfo) => boolean)
): TaskInfo[] {
	/**
	 * A function used to determine which tasks to include in the returned data.
	 */
	const matcher = useMemo(() => {
		if (Array.isArray(matcherArg)) {
			return ({ id }: Pick<TaskInfo, 'id'>) => matcherArg.includes(id);
		}

		return matcherArg;
	}, [matcherArg]);

	/**
	 * A list of the previous set of matching tasks, used to detect when a
	 * task changes in a way that makes it no longer match.
	 */
	const matchingTaskIds = useRef<number[]>([]);

	/**
	 * Gets the requested task info, either for all tasks or a limited set.
	 */
	const getMatchingTaskInfo = useCallback(() => {
		const allTasks = getAllTaskInfo();

		if (matcher) {
			return allTasks.filter(matcher);
		}
		return allTasks;
	}, [matcher]);

	/**
	 * Update the list of matching task IDs, and the `thisTaskInfo` state variable.
	 */
	const updateThisTaskInfo = useCallback(() => {
		const matchingTaskInfo = getMatchingTaskInfo();
		matchingTaskIds.current = matchingTaskInfo.map(({ id }) => id);
		setThisTaskInfo(getMatchingTaskInfo());
	}, [getMatchingTaskInfo]);

	// Initialise thisTaskInfo based on the passed matcher
	const [thisTaskInfo, setThisTaskInfo] = useState(() => {
		// Initialise `matchingTaskIds` at the same time
		const matchingTasks = getMatchingTaskInfo();
		matchingTaskIds.current = matchingTasks.map(({ id }) => id);
		return matchingTasks;
	});

	const doneInitialRender = useRef(false);

	// Update thisTaskInfo if the matcher changes
	useEffect(() => {
		// Don't re-set the state during the initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		updateThisTaskInfo();
	}, [updateThisTaskInfo]);

	/**
	 * Update the task info on update if and only if something
	 * in the list of matching tasks has changed, including if
	 * a previously matched task no longer matches.
	 */
	const handleTaskInfoUpdate = useCallback((changes: { value: TaskInfo; }[]) => {
		// If there's no matcher, we watch every task so always update on change
		if (typeof matcher === 'undefined') {
			updateThisTaskInfo();
			return;
		}

		// Check if a matching task has changed, or a
		// task has been removed from the matching list
		const hasChanged = (() => {
			return Boolean(changes.find(({ value }) => {
				const matches = matcher(value);

				// If the task matches, or if it did match previously
				if (matches || matchingTaskIds.current.includes(value.id)) {
					return true;
				}
				return false;
			}));
		})();

		if (hasChanged) {
			updateThisTaskInfo();
		}
	}, [matcher, updateThisTaskInfo]);

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
