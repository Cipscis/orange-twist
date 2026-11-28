import { useMemo } from 'preact/hooks';

import {
	type AsyncActionState,
	useLiveData,
} from 'utils/asyncAction';

import type { Task } from '../../types';

import { LiveTask } from '../LiveTask';

/**
 * Attempts to load a specified task immediately, and reloads it if it is changed in the database. Provides an {@linkcode AsyncActionState} representing the state of that loading operation.
 */
export function useTask(taskId: number): AsyncActionState<Task> {
	const liveTask = useMemo(() => {
		const liveTask = new LiveTask(taskId);
		liveTask.observe();
		return liveTask;
	}, [taskId]);

	return useLiveData(liveTask);
}
