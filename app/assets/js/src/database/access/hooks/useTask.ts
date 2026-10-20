import { useMemo } from 'preact/hooks';

import {
	type AsyncDataState,
	useLiveData,
} from 'utils/asyncData';

import type { Task } from '../../types';

import { LiveTask } from '../LiveTask';

/**
 * Attempts to load a specified task immediately, and reloads it if it is changed in the database. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useTask(taskId: number): AsyncDataState<Task> {
	const liveTask = useMemo(() => {
		const liveTask = new LiveTask(taskId);
		liveTask.observe();
		return liveTask;
	}, [taskId]);

	return useLiveData(liveTask);
}
