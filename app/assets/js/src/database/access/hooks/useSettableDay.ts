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

import type { Day } from '../../types';

import { loadDay } from '../loadDay';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';
import { SaveType } from '../SaveAction';
import { SettableLiveData } from '../SettableLiveData';
import { useSettableLiveData } from './useSettableLiveData';

/**
 * Attempts to load a specified day immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation and providing a setter method.
 *
 * @see {@linkcode useSettableAsyncData}
 */
export function useSettableDay(dayId: number): ExpandType<
	Omit<SettableAsyncDataResult<Day>, 'getData'>
> {
	const settableDay = useMemo(() => {
		const settableDay = new SettableLiveData({
			optimistic: true,
			async getData(_options) {
				const day = await loadDay(dayId);

				if (day === null) {
					throw new Error(`Could not find day with ID ${dayId}`);
				}

				return day;
			},
			async setData(day, _signal) {
				await fireCommand(Command.DATA_SAVE, [{
					type: SaveType.DAY,
					id: dayId,
					day,
				}]);
			},
			observeState(getData, state, signal) {
				const changeEntity = {
					type: ChangeEntityType.DAY,
					id: dayId,
				};

				if (settableDay.liveData.state.type === AsyncDataStateType.ERROR) {
					addChangeListener(
						ChangeType.ADD,
						changeEntity,
						() => getData(),
						{ signal },
					);
				} else if (settableDay.liveData.state.type === AsyncDataStateType.SUCCESS) {
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
		settableDay.observe();

		return settableDay;
	}, [dayId]);

	return useSettableLiveData(settableDay);
}
