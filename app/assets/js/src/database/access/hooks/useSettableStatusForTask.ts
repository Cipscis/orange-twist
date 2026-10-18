import { useMemo } from 'preact/hooks';

import {
	AsyncDataStateType,
	type ExpandType,
	type SettableAsyncDataResult,
} from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { loadStatusForTask } from '../loadStatusForTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
	defineChangeEntity,
} from '../liveAccessManager';
import { SaveType } from '../SaveAction';
import { useSettableLiveData } from './useSettableLiveData';
import { SettableLiveData } from '../SettableLiveData';

/**
 * Attempts to load a the status for a specified task immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode SettableAsyncDataResult} representing the state of that loading operation and providing a setter method.
 */
export function useSettableStatusForTask(taskId: number): ExpandType<
	Omit<SettableAsyncDataResult<number>, 'getData'>
> {
	const settableStatusForTask = useMemo(() => {
		const settableStatusForTask = new SettableLiveData({
			optimistic: true,
			async getData(_options) {
				const status = await loadStatusForTask(taskId);

				if (status === null) {
					throw new Error(`Could not find task with ID ${taskId}`);
				}

				return status;
			},
			async setData(status, _signal) {
				await fireCommand(Command.DATA_SAVE, [{
					type: SaveType.TASK_STATUS,
					id: taskId,
					status,
				}]);
			},
			observeState(getData, state, signal) {
				const changeEntity = defineChangeEntity({
					type: ChangeEntityType.DAY_TASK,
				});

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
		settableStatusForTask.observe();
		return settableStatusForTask;
	}, [taskId]);

	return useSettableLiveData(settableStatusForTask);
}
