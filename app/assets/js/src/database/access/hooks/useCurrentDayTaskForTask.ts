import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	AsyncDataStateType,
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
export function useCurrentDayTaskForTask(taskId: number): AsyncDataState<DayTask> {
	const getCurrentDayTaskForTask = useCallback(async () => {
		const currentDate = getCurrentDate();
		const currentDay = await loadDayByDate(currentDate);
		if (!currentDay) {
			throw new Error(`Could not find current day task for task ${taskId}`);
		}

		const currentDayTask = await loadDayTaskForDayAndTask({
			day: currentDay.id,
			task: taskId,
		});
		if (!currentDayTask) {
			throw new Error(`Could not find current day task for task ${taskId}`);
		}

		return currentDayTask;
	}, [taskId]);

	const asyncDataResult = useAsyncData(getCurrentDayTaskForTask, { immediate: true });

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		if (asyncDataResult.state.type === AsyncDataStateType.ERROR) {
			// TODO: Limit refreshes to when the day task is for this task
			addChangeListener(
				ChangeType.ADD,
				{ type: ChangeEntityType.DAY_TASK, id: -1 },
				asyncDataResult.getData,
				{ signal },
			);
		} else if (asyncDataResult.state.type === AsyncDataStateType.SUCCESS) {
			addChangeListener(
				ChangeType.CHANGE,
				{ type: ChangeEntityType.DAY_TASK, id: asyncDataResult.state.data.id },
				asyncDataResult.getData,
				{ signal },
			);

			addChangeListener(
				ChangeType.DELETE,
				{ type: ChangeEntityType.DAY_TASK, id: asyncDataResult.state.data.id },
				asyncDataResult.getData,
				{ signal },
			);
		}

		return () => controller.abort();
	}, [taskId, asyncDataResult]);

	return asyncDataResult.state;
}
