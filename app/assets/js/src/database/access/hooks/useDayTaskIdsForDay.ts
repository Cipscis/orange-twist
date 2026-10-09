import { useCallback, useEffect } from 'preact/hooks';

import { useAsyncData, type AsyncDataState } from 'utils';

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

		addChangeListener(
			ChangeType.CHANGE,
			ChangeEntityType.DAY_TASK_DAY,
			dayId,
			asyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [dayId, asyncDataResult.getData]);

	return asyncDataResult.state;
}
