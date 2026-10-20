import { AsyncDataStateType, LiveData } from 'utils/asyncData';

import type { Status } from '../types';

import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';
import { loadStatusForTask } from './loadStatusForTask';
import { loadStatus } from './loadStatus';

export class LiveStatusForTask extends LiveData<Status> {
	constructor(taskId: number) {
		super({
			async getData(_options) {
				const statusId = await loadStatusForTask(taskId);

				if (statusId === null) {
					throw new Error(`Could not find task with ID ${taskId}`);
				}

				const status = await loadStatus(statusId);

				if (status === null) {
					throw new Error(`Could not find status with ID ${statusId}`);
				}

				return status;
			},
			observeState(getData, state, signal) {
				// Don't need to watch for status changes as they never change

				// TODO: Only care about day tasks for this task
				const changeEntity = {
					type: ChangeEntityType.DAY_TASK,
				};

				if (state.type === AsyncDataStateType.SUCCESS) {
					addChangeListener(
						ChangeType.ADD,
						changeEntity,
						() => getData(),
						{ signal },
					);

					addChangeListener(
						ChangeType.CHANGE,
						changeEntity,
						() => getData(),
						{ signal },
					);

					addChangeListener(
						ChangeType.DELETE,
						changeEntity,
						() => getData(),
						{ signal },
					);
				}
			},
		});
	}
}
