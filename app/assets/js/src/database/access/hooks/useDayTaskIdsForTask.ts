import { useMemo } from 'preact/hooks';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { loadDayTaskIdsForTask } from '../loadDayTaskIdsForTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

import { LiveData } from '../LiveData';
import { useLiveData } from './useLiveData';

/**
 * Attempts to load a list of all day task IDs for a given task. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useDayTaskIdsForTask(taskId: number): AsyncDataState<readonly number[]> {
	const liveDayTaskIds = useMemo(() => {
		const liveDayTaskIds = new LiveData({
			getData(_options) {
				return loadDayTaskIdsForTask(taskId);
			},
			observe(getData, signal) {
				// TODO: Limit refreshes to when the day task is for this task
				addChangeListener(
					ChangeType.ADD,
					{ type: ChangeEntityType.DAY_TASK },
					() => getData(),
					{ signal },
				);
			},
			observeState(getData, state, signal) {
				if (state.type === AsyncDataStateType.SUCCESS) {
					for (const id of state.data) {
						addChangeListener(
							ChangeType.CHANGE,
							{ type: ChangeEntityType.DAY_TASK, id },
							() => getData(),
							{ signal },
						);

						addChangeListener(
							ChangeType.DELETE,
							{ type: ChangeEntityType.DAY_TASK, id },
							() => getData(),
							{ signal },
						);
					}
				}
			},
		});
		liveDayTaskIds.observe();
		return liveDayTaskIds;
	}, [taskId]);

	return useLiveData(liveDayTaskIds);
}
