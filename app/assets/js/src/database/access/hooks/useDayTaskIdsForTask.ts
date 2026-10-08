import { useCallback, useEffect } from 'preact/hooks';

import { useAsyncData, type AsyncDataState } from 'utils';

import { loadDayTaskIdsForTask } from '../loadDayTaskIdsForTask';
import { addChangeListener, ChangeType } from '../liveAccessManager';

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

		addChangeListener(
			ChangeType.DAY_TASK_TASK,
			taskId,
			asyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [taskId, asyncDataResult.getData]);

	return asyncDataResult.state;
}
