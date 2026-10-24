import { AsyncDataStateType, LiveData } from 'utils/asyncData';

import type { Status, Task } from '../types';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';

import { loadTask } from './loadTask';
import { loadStatusForTask } from './loadStatusForTask';
import { loadStatus } from './loadStatus';

/**
 * Provides live access to a task and its status, derived from its canonical day task.
 */
export class LiveTaskWithStatus extends LiveData<[Task, Status]> {
	constructor(taskId: number) {
		super({
			async getData(_options) {
				const taskPromise = loadTask(taskId);
				const statusId = await loadStatusForTask(taskId);

				if (statusId === null) {
					throw new Error(`Could not find task with ID ${taskId}`);
				}

				const status = await loadStatus(statusId);

				if (status === null) {
					throw new Error(`Could not find status with ID ${statusId}`);
				}

				const task = await taskPromise;
				if (task === null) {
					throw new Error(`Could not find task with ID ${taskId}`);
				}

				return [task, status];
			},
			observeState(getDataArg, state, signal) {
				// Task listeners
				const taskChangeEntity = {
					type: ChangeEntityType.TASK,
					id: taskId,
				};

				const getData = () => getDataArg();

				if (state.type === AsyncDataStateType.ERROR) {
					addChangeListener(
						ChangeType.ADD,
						taskChangeEntity,
						getData,
						{ signal },
					);
				} else if (state.type === AsyncDataStateType.SUCCESS) {
					addChangeListener(
						ChangeType.CHANGE,
						taskChangeEntity,
						getData,
						{ signal },
					);

					addChangeListener(
						ChangeType.DELETE,
						taskChangeEntity,
						getData,
						{ signal },
					);
				}

				// Day task listeners for task status
				// TODO: Only care about day tasks for this task
				const dayTaskChangeEntity = {
					type: ChangeEntityType.DAY_TASK,
				};

				if (state.type === AsyncDataStateType.SUCCESS) {
					addChangeListener(
						ChangeType.ADD,
						dayTaskChangeEntity,
						getData,
						{ signal },
					);

					addChangeListener(
						ChangeType.CHANGE,
						dayTaskChangeEntity,
						getData,
						{ signal },
					);

					addChangeListener(
						ChangeType.DELETE,
						dayTaskChangeEntity,
						getData,
						{ signal },
					);
				}
			},
		});
	}
}
