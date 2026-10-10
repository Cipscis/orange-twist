import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	AsyncDataStateType,
	useSettableAsyncData,
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
	type ChangeEntity,
} from '../liveAccessManager';
import { SaveType } from '../SaveAction';

/**
 * Attempts to load a the status for a specified task immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode SettableAsyncDataResult} representing the state of that loading operation and providing a setter method.
 *
 * @see {@linkcode useSettableAsyncData}
 */
export function useSettableStatusForTask(taskId: number): ExpandType<
	Omit<SettableAsyncDataResult<number>, 'getData'>
> {
	const getStatusForTask = useCallback(async () => {
		const status = await loadStatusForTask(taskId);

		if (status === null) {
			throw new Error(`Could not find task with ID ${taskId}`);
		}

		return status;
	}, [taskId]);

	const setStatusForTask = useCallback(async (status: number) => {
		await fireCommand(Command.DATA_SAVE, [{
			type: SaveType.TASK_STATUS,
			id: taskId,
			status,
		}]);
	}, [taskId]);

	const asyncDataResult = useSettableAsyncData({
		getData: getStatusForTask,
		setData: setStatusForTask,
		optimistic: true,
		immediate: true,
	});

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		// TODO: Only care about changes to day tasks for this task
		const changeEntity: ChangeEntity = {
			type: ChangeEntityType.DAY_TASK,
		};

		if (asyncDataResult.stateOfGet.type === AsyncDataStateType.SUCCESS) {
			addChangeListener(
				ChangeType.ADD,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);

			addChangeListener(
				ChangeType.CHANGE,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);

			addChangeListener(
				ChangeType.DELETE,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);
		}

		return () => controller.abort();
	}, [taskId, asyncDataResult]);

	return asyncDataResult;
}
