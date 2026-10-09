import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	useSettableAsyncData,
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

/**
 * Attempts to load a specified day task immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation and providing a setter method.
 *
 * @see {@linkcode useSettableAsyncData}
 */
export function useSettableDayTask(dayTaskId: number): ExpandType<
	Omit<SettableAsyncDataResult<DayTask>, 'getData'>
> {
	const getDayTask = useCallback(async () => {
		const dayTask = await loadDayTask(dayTaskId);

		if (dayTask === null) {
			throw new Error(`Could not find day task with ID ${dayTaskId}`);
		}

		return dayTask;
	}, [dayTaskId]);

	const setDayTask = useCallback(async (dayTask: Partial<
		Omit<DayTask, 'id'>
	>) => {
		await fireCommand(Command.DATA_SAVE, [{
			type: SaveType.DAY_TASK,
			id: dayTaskId,
			dayTask,
		}]);
	}, [dayTaskId]);

	const asyncDataResult = useSettableAsyncData({
		getData: getDayTask,
		setData: setDayTask,
		optimistic: true,
		immediate: true,
	});

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addChangeListener(
			ChangeType.CHANGE,
			{ type: ChangeEntityType.DAY_TASK, id: dayTaskId },
			asyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [dayTaskId, asyncDataResult.getData]);

	return asyncDataResult;
}
