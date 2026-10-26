import { SettableLiveData } from 'utils/asyncData';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { loadAllStatuses } from './loadAllStatuses';
import { loadTaskIdsForStatuses } from './loadTaskIdsForStatuses';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';
import { SaveType } from './SaveAction';

/**
 * Provides live access to a list of all task IDs for tasks with a status that hasn't marked them as completed. This list is sorted according to those tasks' sort indices.
 */
export class LiveSettableUnfinishedTaskIds extends SettableLiveData<readonly number[]> {
	constructor() {
		super({
			optimistic: true,
			async getData(_options) {
				const statuses = await loadAllStatuses();
				const unfinishedStatusIds = statuses
					.filter(({ completed }) => !completed)
					.map(({ id }) => id);

				const taskIds = await loadTaskIdsForStatuses(unfinishedStatusIds);

				return taskIds;
			},
			setData(data, _signal) {
				return fireCommand(Command.DATA_SAVE, data.map(
					(id, sortIndex) => ({
						type: SaveType.TASK,
						id,
						task: { sortIndex },
					})
				));
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
				addChangeListener(ChangeType.ADD, changeEntityTasks, getData);
				// TODO: Only care about when sortIndex has changed
				addChangeListener(ChangeType.CHANGE, changeEntityTasks, getData);
				// TODO: Find a way to only observe changes to tasks without a canonical day task
				addChangeListener(ChangeType.DELETE, changeEntityTasks, getData);
			},
		});
	}
}
