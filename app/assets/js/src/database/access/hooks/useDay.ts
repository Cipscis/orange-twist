import { useMemo } from 'preact/hooks';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import type { Day } from '../../types';

import { loadDay } from '../loadDay';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

import { LiveData } from '../LiveData';
import { useLiveData } from './useLiveData';

/**
 * Attempts to load a specified day immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useDay(dayId: number): AsyncDataState<Day> {
	const liveDay = useMemo(() => {
		const liveDay = new LiveData({
			async getData(options) {
				const day = await loadDay(dayId);

				if (day === null) {
					throw new Error(`Could not find day with ID ${dayId}`);
				}

				return day;
			},
			observe(getData, signal) {

			},
			observeState(getData, state, signal) {
				const changeEntity = {
					type: ChangeEntityType.DAY,
					id: dayId,
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
		liveDay.observe();
		return liveDay;
	}, [dayId]);

	return useLiveData(liveDay);
}
