import { useCallback, useEffect } from 'preact/hooks';

import { useAsyncData, type AsyncDataState } from 'utils';

import { loadDayTaskIdsForTask } from '../loadDayTaskIdsForTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

/**
 * Attempts to load a list of all day task IDs for a given task. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useDayTaskIdsForTask(taskId: number): AsyncDataState<readonly number[]> {
	const getDayTaskIds = useCallback(() => loadDayTaskIdsForTask(taskId), [taskId]);

	const asyncDataResult = useAsyncData(getDayTaskIds, { immediate: true });

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		// TODO: Refactor this to listening to new day tasks being added for this task and listed day tasks being updated or deleted

		// addChangeListener(
		// 	ChangeType.CHANGE,
		// 	ChangeEntityType.DAY_TASK_TASK,
		// 	taskId,
		// 	asyncDataResult.getData,
		// 	{ signal },
		// );

		return () => controller.abort();
	}, [taskId, asyncDataResult.getData]);

	return asyncDataResult.state;
}
