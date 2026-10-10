import { useCallback, useEffect } from 'preact/hooks';

import {
	AsyncDataStateType,
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import { loadDayTaskIdsForDay } from '../loadDayTaskIdsForDay';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

/**
 * Attempts to load a list of all day task IDs for a given day. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useDayTaskIdsForDay(dayId: number): AsyncDataState<readonly number[]> {
	const getDayTaskIds = useCallback(() => loadDayTaskIdsForDay(dayId), [dayId]);

	const asyncDataResult = useAsyncData(getDayTaskIds, { immediate: true });

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		// TODO: Limit refreshes to when the day task is for this day
		addChangeListener(
			ChangeType.ADD,
			{ type: ChangeEntityType.DAY_TASK, id: -1 },
			asyncDataResult.getData,
			{ signal },
		);

		if (asyncDataResult.state.type === AsyncDataStateType.SUCCESS) {
			for (const dayTaskId of asyncDataResult.state.data) {
				// TODO: Limit refreshes to when the day task's sortIndex was updated
				addChangeListener(
					ChangeType.CHANGE,
					{ type: ChangeEntityType.DAY_TASK, id: dayTaskId },
					asyncDataResult.getData,
					{ signal },
				);

				addChangeListener(
					ChangeType.DELETE,
					{ type: ChangeEntityType.DAY_TASK, id: dayTaskId },
					asyncDataResult.getData,
					{ signal },
				);
			}
		}

		return () => controller.abort();
	}, [asyncDataResult]);

	return asyncDataResult.state;
}
