import { useMemo } from 'preact/hooks';

import type { AsyncDataState } from 'utils';

import type { Task } from '../../types';

import { ChangeEntityType } from '../liveAccessManager';
import { ObservableEntity } from '../ObservableEntity';
import { useLiveData } from './useLiveData';

/**
 * Attempts to load a specified task immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useTask(taskId: number): AsyncDataState<Task> {
	const liveTask = useMemo(() => {
		const liveTask = new ObservableEntity({
			type: ChangeEntityType.TASK,
			id: taskId,
		});
		liveTask.observe();
		return liveTask;
	}, [taskId]);

	return useLiveData(liveTask);
}
