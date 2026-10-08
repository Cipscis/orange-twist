import {
	useCallback,
	useEffect,
	useRef,
} from 'preact/hooks';

import {
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Task } from '../../types';

import { loadTask } from '../loadTask';
import { addChangeListener, ChangeType } from '../liveAccessManager';

/**
 * Attempts to load a specified task immediately, and reloads it if it is changed in the database. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useTask(taskId: number): AsyncDataState<Task> {
	const getTask = useCallback(async () => {
		const task = await loadTask(taskId);

		if (task === null) {
			throw new Error(`Could not find task with ID ${taskId}`);
		}

		return task;
	}, [taskId]);

	const asyncDataResult = useAsyncData(getTask, { immediate: true });

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addChangeListener(
			ChangeType.TASK,
			taskId,
			asyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [taskId, asyncDataResult.getData]);

	// Don't re-enter loading state on re-requesting data
	const asyncDataResultStateRef = useRef(asyncDataResult.state);
	if (!asyncDataResult.state.loading) {
		asyncDataResultStateRef.current = asyncDataResult.state;
	}

	return asyncDataResultStateRef.current;
}
