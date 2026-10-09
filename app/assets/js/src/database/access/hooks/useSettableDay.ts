import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	AsyncDataStateType,
	useSettableAsyncData,
	type AsyncDataState,
	type ExpandType,
	type SettableAsyncDataResult,
} from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import type { Day } from '../../types';

import { loadDay } from '../loadDay';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
	type ChangeEntity,
} from '../liveAccessManager';
import { SaveType } from '../SaveAction';

/**
 * Attempts to load a specified day immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation and providing a setter method.
 *
 * @see {@linkcode useSettableAsyncData}
 */
export function useSettableDay(dayId: number): ExpandType<
	Omit<SettableAsyncDataResult<Day>, 'getData'>
> {
	const getDay = useCallback(async () => {
		const day = await loadDay(dayId);

		if (day === null) {
			throw new Error(`Could not find day with ID ${dayId}`);
		}

		return day;
	}, [dayId]);

	const setDay = useCallback(async (day: Partial<
		Omit<Day, 'id'>
	>) => {
		await fireCommand(Command.DATA_SAVE, [{
			type: SaveType.DAY,
			id: dayId,
			day,
		}]);
	}, [dayId]);

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

		const changeEntity: ChangeEntity = {
			type: ChangeEntityType.DAY,
			id: dayId,
		};

		if (asyncDataResult.stateOfGet.type === AsyncDataStateType.ERROR) {
			addChangeListener(
				ChangeType.ADD,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);
		} else if (asyncDataResult.stateOfGet.type === AsyncDataStateType.SUCCESS) {
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
	}, [dayId, asyncDataResult]);

	return asyncDataResult;
}
