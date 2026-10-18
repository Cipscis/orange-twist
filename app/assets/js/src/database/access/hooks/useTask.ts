import { useMemo } from 'preact/hooks';

import {
	AsyncDataStateType,
	type AsyncDataState,
	LiveData,
	useLiveData,
} from 'utils/asyncData';

import type { Task } from '../../types';

import { loadTask } from '../loadTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

/**
 * Attempts to load a specified task immediately, and reloads it if it is changed in the database. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useTask(taskId: number): AsyncDataState<Task> {
	const liveTask = useMemo(() => {
		const liveTask = new LiveData({
			async getData(options) {
				const task = await loadTask(taskId);

				if (task === null) {
					throw new Error(`Could not find task with ID ${taskId}`);
				}

				return task;
			},
			observeState(getData, state, signal) {
				const changeEntity = {
					type: ChangeEntityType.TASK,
					id: taskId,
				};

				if (state.type === AsyncDataStateType.ERROR) {
					addChangeListener(
						ChangeType.ADD,
						changeEntity,
						() => getData(),
						{ signal },
					);
				} else if (state.type === AsyncDataStateType.SUCCESS) {
					addChangeListener(
						ChangeType.CHANGE,
						changeEntity,
						() => getData(),
						{ signal },
					);

					addChangeListener(
						ChangeType.DELETE,
						changeEntity,
						() => getData(),
						{ signal },
					);
				}
			},
		});
		liveTask.observe();
		return liveTask;
	}, [taskId]);

	return useLiveData(liveTask);
}
