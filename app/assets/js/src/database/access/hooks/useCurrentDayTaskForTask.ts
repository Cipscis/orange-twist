import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	getCurrentDate,
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { DayTask } from '../../types';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';
import { loadDayByDate } from '../loadDayByDate';
import { loadDayTaskForDayAndTask } from '../loadDayTaskForDayAndTask';

/**
 * Provides an {@linkcode AsyncDataState} that immediately requests the day task for a specified task and the current day.
 */
export function useCurrentDayTaskForTask(taskId: number): AsyncDataState<DayTask | null> {
	const getCurrentDayTaskForTask = useCallback(async () => {
		const currentDate = getCurrentDate();
		const currentDay = await loadDayByDate(currentDate);
		if (!currentDay) {
			return null;
		}

		const currentDayTask = await loadDayTaskForDayAndTask({
			day: currentDay.id,
			task: taskId,
		});
		return currentDayTask;
	}, [taskId]);

	const asyncDataResult = useAsyncData(getCurrentDayTaskForTask, { immediate: true });

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addChangeListener(
			ChangeType.CHANGE,
			ChangeEntityType.DAY_TASK_TASK,
			taskId,
			asyncDataResult.getData,
			{ signal }
		);

		return () => controller.abort();
	}, [taskId, asyncDataResult.getData]);

	return asyncDataResult.state;
}
