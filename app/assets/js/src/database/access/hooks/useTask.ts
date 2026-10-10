import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	AsyncDataStateType,
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Task } from '../../types';

import { loadTask } from '../loadTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
	type ChangeEntity,
} from '../liveAccessManager';

/**
 * Attempts to load a specified task immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation and providing a setter method.
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

		const changeEntity: ChangeEntity = {
			type: ChangeEntityType.TASK,
			id: taskId,
		};

		if (asyncDataResult.state.type === AsyncDataStateType.ERROR) {
			addChangeListener(
				ChangeType.ADD,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);
		} else if (asyncDataResult.state.type === AsyncDataStateType.SUCCESS) {
			addChangeListener(
				ChangeType.CHANGE,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);

			addChangeListener(
				ChangeType.DELETE,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);
		}

		return () => controller.abort();
	}, [taskId, asyncDataResult]);

	return asyncDataResult.state;
}
