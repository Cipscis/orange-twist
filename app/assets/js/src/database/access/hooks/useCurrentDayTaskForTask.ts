import { useMemo } from 'preact/hooks';

import { getCurrentDate } from 'utils';
import {
	AsyncActionStateType,
	type AsyncActionState,
	LiveData,
	useLiveData,
} from 'utils/asyncAction';

import type { DayTask } from '../../types';

import { loadDayByDate } from '../loadDayByDate';
import { loadDayTaskForDayAndTask } from '../loadDayTaskForDayAndTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

/**
 * Provides an {@linkcode AsyncActionState} that immediately requests the day task for a specified task and the current day.
 */
export function useCurrentDayTaskForTask(taskId: number): AsyncActionState<DayTask> {
	const liveCurrentDayTaskForTask = useMemo(() => {
		const liveCurrentDayTaskForTask = new LiveData({
			async getData(options) {
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
			},
			observeState(getData, state, signal) {
				if (state.type === AsyncActionStateType.ERROR) {
					// TODO: Limit refreshes to when the day task is for this task
					addChangeListener(
						ChangeType.ADD,
						{ type: ChangeEntityType.DAY_TASK },
						() => getData(),
						{ signal },
					);
				} else if (state.type === AsyncActionStateType.SUCCESS) {
					const { id } = state.data;
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
			},
		});
		liveCurrentDayTaskForTask.observe();
		return liveCurrentDayTaskForTask;
	}, [taskId]);

	return useLiveData(liveCurrentDayTaskForTask);
}
