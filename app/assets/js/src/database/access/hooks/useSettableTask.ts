import { useMemo } from 'preact/hooks';

import {
	AsyncDataStateType,
	useSettableAsyncData,
	type AsyncDataState,
	type ExpandType,
	type SettableAsyncDataResult,
} from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import type { Task } from '../../types';

import { loadTask } from '../loadTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
	defineChangeEntity,
} from '../liveAccessManager';
import { SaveType } from '../SaveAction';
import { SettableLiveData } from '../SettableLiveData';
import { useSettableLiveData } from './useSettableLiveData';

/**
 * Attempts to load a specified task immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation and providing a setter method.
 *
 * @see {@linkcode useSettableAsyncData}
 */
export function useSettableTask(taskId: number): ExpandType<
	Omit<SettableAsyncDataResult<Task>, 'getData'>
> {
	const settableTask = useMemo(() => {
		const settableTask = new SettableLiveData({
			optimistic: true,
			async getData(_options) {
				const task = await loadTask(taskId);

				if (task === null) {
					throw new Error(`Could not find task with ID ${taskId}`);
				}

				return task;
			},
			async setData(task, _signal) {

				await fireCommand(Command.DATA_SAVE, [{
					type: SaveType.TASK,
					id: taskId,
					task,
				}]);
			},
			observeState(getData, state, signal) {
				const changeEntity = defineChangeEntity({
					type: ChangeEntityType.TASK,
					id: taskId,
				});

				if (state.type === AsyncDataStateType.ERROR) {
					addChangeListener(
						ChangeType.ADD,
						changeEntity,
						() => getData(),
						{ signal },
					);
				} else if (state.type === AsyncDataStateType.SUCCESS) {
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
		settableTask.observe();
		return settableTask;
	}, [taskId]);

	return useSettableLiveData(settableTask);
}
