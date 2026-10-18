import { useMemo } from 'preact/hooks';

import {
	AsyncDataStateType,
	type AsyncDataState,
	type ExpandType,
	type SettableAsyncDataResult,
} from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import type { DayTask } from '../../types';

import { loadDayTask } from '../loadDayTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';
import { SaveType } from '../SaveAction';
import { SettableLiveData } from '../SettableLiveData';
import { useSettableLiveData } from './useSettableLiveData';

/**
 * Attempts to load a specified day task immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation and providing a setter method.
 */
export function useSettableDayTask(dayTaskId: number): ExpandType<
	Omit<SettableAsyncDataResult<DayTask>, 'getData'>
> {
	const settableDayTask = useMemo(() => {
		const settableDayTask = new SettableLiveData({
			optimistic: true,
			async getData(_options) {
				const dayTask = await loadDayTask(dayTaskId);

				if (dayTask === null) {
					throw new Error(`Could not find day task with ID ${dayTaskId}`);
				}

				return dayTask;
			},
			async setData(dayTask, _signal) {
				await fireCommand(Command.DATA_SAVE, [{
					type: SaveType.DAY_TASK,
					id: dayTaskId,
					dayTask,
				}]);
			},
			observeState(getData, state, signal) {
				const changeEntity = {
					type: ChangeEntityType.DAY_TASK,
					id: dayTaskId,
				};

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
		settableDayTask.observe();
		return settableDayTask;
	}, [dayTaskId]);

	return useSettableLiveData(settableDayTask);
}
