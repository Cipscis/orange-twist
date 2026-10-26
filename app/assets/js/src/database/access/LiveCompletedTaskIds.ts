import { LiveData } from 'utils/asyncData';

import { loadAllStatuses } from './loadAllStatuses';
import { loadTaskIdsForStatuses, TaskSortingMethod } from './loadTaskIdsForStatuses';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';

/**
 * Provides live access to a list of all task IDs for tasks with a status that has marked them as completed. This list is sorted in reverse chronological order according to the day associated with those tasks' canonical day task.
 */
export class LiveCompletedTaskIds extends LiveData<readonly number[]> {
	constructor() {
		super({
			async getData(_options) {
				const statuses = await loadAllStatuses();
				const completedStatusIds = statuses
					.filter(({ completed }) => completed)
					.map(({ id }) => id);

				const taskIds = await loadTaskIdsForStatuses(
					completedStatusIds,
					{
						sortingMethod: TaskSortingMethod.REVERSE_CHRONOLOGICAL,
					},
				);

				return taskIds;
			},
			observe(getDataArg, _signal) {
				const getData = () => getDataArg();

				// No need to observe statuses, because they never change

				// TODO: Find a way to only observe changes to canonical day tasks
				const changeEntityDayTasks = { type: ChangeEntityType.DAY_TASK };
				addChangeListener(ChangeType.ADD, changeEntityDayTasks, getData);
				// TODO: Only care about when the status has changed
				addChangeListener(ChangeType.CHANGE, changeEntityDayTasks, getData);
				addChangeListener(ChangeType.DELETE, changeEntityDayTasks, getData);

				const changeEntityTasks = { type: ChangeEntityType.TASK };
				// TODO: Find a way to only observe changes to tasks with a canonical day task with a completed status
				addChangeListener(ChangeType.DELETE, changeEntityTasks, getData);
			},
		});
	}
}
