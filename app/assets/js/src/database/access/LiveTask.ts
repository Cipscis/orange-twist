import { AsyncDataStateType, LiveData } from 'utils/asyncData';

import type { Task } from '../types';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';
import { loadTask } from './loadTask';

/**
 * Provides live access to a task.
 */
export class LiveTask extends LiveData<Task> {
	constructor(taskId: number) {
		super({
			async getData(_options) {
				const task = await loadTask(taskId);

				if (task === null) {
					throw new Error(`Could not find task with ID ${taskId}`);
				}

				return task;
			},
			observeState(getDataArg, state, signal) {
				const changeEntity = {
					type: ChangeEntityType.TASK,
					id: taskId,
				};

				const getData = () => getDataArg();

				if (state.type === AsyncDataStateType.ERROR) {
					addChangeListener(
						ChangeType.ADD,
						changeEntity,
						getData,
						{ signal },
					);
				} else if (state.type === AsyncDataStateType.SUCCESS) {
					addChangeListener(
						ChangeType.CHANGE,
						changeEntity,
						getData,
						{ signal },
					);

					addChangeListener(
						ChangeType.DELETE,
						changeEntity,
						getData,
						{ signal },
					);
				}
			},
		});
	}
}
