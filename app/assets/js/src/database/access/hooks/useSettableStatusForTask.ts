import { useMemo } from 'preact/hooks';

import {
	AsyncDataStateType,
	SettableLiveData,
	useSettableLiveData,
	type UseSettableLiveDataResult,
} from 'utils/asyncData';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { loadStatusForTask } from '../loadStatusForTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';
import { SaveType } from '../SaveAction';

/**
 * Attempts to load a the status for a specified task immediately, and reloads it if it is changed in the database. Provides a {@linkcode UseSettableLiveDataResult} representing the state of that loading operation, also providing a setter method and the state of any set operation.
 */
export function useSettableStatusForTask(taskId: number): UseSettableLiveDataResult<number> {
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
		settableStatusForTask.observe();
		return settableStatusForTask;
	}, [taskId]);

	return useSettableLiveData(settableStatusForTask);
}
