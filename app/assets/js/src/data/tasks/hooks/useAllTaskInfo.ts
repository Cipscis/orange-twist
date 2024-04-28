import {
	useMemo,
} from 'preact/hooks';

import { useRegister } from 'utils';

import type { TaskInfo } from '../types/TaskInfo';
import { tasksRegister } from '../tasksRegister';

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
export function useAllTaskInfo(taskIds: readonly number[]): readonly TaskInfo[];
export function useAllTaskInfo(matcher: (task: TaskInfo) => boolean): readonly TaskInfo[];
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function useAllTaskInfo(
	matcher?: readonly number[] | ((task: TaskInfo) => boolean)
): readonly TaskInfo[];
export function useAllTaskInfo(
	matcherArg?: readonly number[] | ((task: TaskInfo) => boolean)
): readonly TaskInfo[] {
	/**
	 * A function used to determine which tasks to include in the returned data.
	 */
	const matcher = useMemo(() => {
		if (Array.isArray(matcherArg)) {
			return (id: TaskInfo['id']) => {
				return matcherArg.includes(id);
			};
		}

		if (matcherArg) {
			return (key: TaskInfo['id'], value: TaskInfo) => matcherArg(value);
		}

		return () => true;
	}, [matcherArg]);

	return useRegister(tasksRegister, matcher);
}
