import { useMemo } from 'preact/hooks';

import {
	AsyncDataStateType,
	type AsyncDataState,
	SettableLiveData,
	useSettableLiveData,
	type UseSettableLiveDataResult,
} from 'utils/asyncData';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { loadDayTaskIdsForDay } from '../loadDayTaskIdsForDay';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';
import { SaveType, type SaveAction } from '../SaveAction';

/**
 * Attempts to load a list of all day task IDs for a given day. Provides an {@linkcode AsyncDataState} representing the state of that loading operation, as well as a setter for updating their order.
 */
export function useSettableDayTaskIdsForDay(dayId: number): UseSettableLiveDataResult<readonly number[]> {
	const settableLiveDayTaskIds = useMemo(() => {
		const liveDayTaskIds = new SettableLiveData({
			optimistic: true,
			getData(_options) {
				return loadDayTaskIdsForDay(dayId);
			},
			setData(data, _signal) {
				// Assumes `data` has the same length and contents as the actual data, so is just a re-render
				const saveActions: readonly Extract<
					SaveAction, { type: typeof SaveType.DAY_TASK; }
				>[] = Array.from(data).map((id, sortIndex) => ({
					type: SaveType.DAY_TASK,
					id,
					dayTask: { sortIndex },
				}));

				return fireCommand(Command.DATA_SAVE, saveActions);
			},
			observe(getData, signal) {
				// TODO: Limit refreshes to when the day task is for this day
				addChangeListener(
					ChangeType.ADD,
					{ type: ChangeEntityType.DAY_TASK },
					() => getData(),
					{ signal },
				);
			},
			observeState(getData, state, signal) {
				if (state.type === AsyncDataStateType.SUCCESS) {
					for (const id of state.data) {
						// TODO: Limit refreshes to when the day task's sortIndex was updated
						addChangeListener(
							ChangeType.CHANGE,
							{ type: ChangeEntityType.DAY_TASK, id },
							() => getData(),
							{ signal },
						);

						addChangeListener(
							ChangeType.DELETE,
							{ type: ChangeEntityType.DAY_TASK, id },
							() => getData(),
							{ signal },
						);
					}
				}
			},
		});
		liveDayTaskIds.observe();
		return liveDayTaskIds;
	}, [dayId]);

	return useSettableLiveData(settableLiveDayTaskIds);
}
