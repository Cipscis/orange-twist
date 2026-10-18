import { useMemo } from 'preact/hooks';

import { AsyncDataStateType, type AsyncDataState } from 'utils/asyncData';

import { loadDayTaskIdsForDay } from '../loadDayTaskIdsForDay';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

import {
	LiveData,
	useLiveData,
} from 'utils/asyncData';

/**
 * Attempts to load a list of all day task IDs for a given day. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useDayTaskIdsForDay(dayId: number): AsyncDataState<readonly number[]> {
	const liveDayTaskIds = useMemo(() => {
		const liveDayTaskIds = new LiveData({
			getData(_options) {
				return loadDayTaskIdsForDay(dayId);
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

	return useLiveData(liveDayTaskIds);
}
