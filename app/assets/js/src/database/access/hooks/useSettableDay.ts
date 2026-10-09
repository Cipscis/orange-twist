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

import type { Day } from '../../types';

import { loadDay } from '../loadDay';
import { addChangeListener, ChangeEntityType } from '../liveAccessManager';
import { SaveType } from '../SaveAction';

/**
 * Attempts to load a specified day immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation and providing a setter method.
 *
 * @see {@linkcode useSettableAsyncData}
 */
export function useSettableDay(taskId: number): ExpandType<
	Omit<SettableAsyncDataResult<Day>, 'getData'>
> {
	const getDay = useCallback(async () => {
		const day = await loadDay(taskId);

		if (day === null) {
			throw new Error(`Could not find day task with ID ${taskId}`);
		}

		return day;
	}, [taskId]);

	const setDay = useCallback(async (day: Partial<
		Omit<Day, 'id'>
	>) => {
		await fireCommand(Command.DATA_SAVE, [{
			type: SaveType.DAY,
			id: taskId,
			day,
		}]);
	}, [taskId]);

	const asyncDataResult = useSettableAsyncData({
		getData: getDay,
		setData: setDay,
		optimistic: true,
		immediate: true,
	});

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addChangeListener(
			ChangeEntityType.DAY,
			taskId,
			asyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [taskId, asyncDataResult.getData]);

	return asyncDataResult;
}
