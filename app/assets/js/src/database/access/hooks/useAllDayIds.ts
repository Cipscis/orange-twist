import { useMemo } from 'preact/hooks';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';
import { loadAllDays } from '../loadAllDays';

import { LiveData } from '../LiveData';
import { useLiveData } from './useLiveData';

/**
 * Attempts to load the IDs of all days immediately, sorted chronologically. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useAllDayIds(): AsyncDataState<readonly number[]> {
	const liveAllDayIds = useMemo(() => {
		const liveAllDayIds = new LiveData({
			async getData(_options) {
				const allDays = await loadAllDays();
				const allDayIds = allDays.map(({ id }) => id);
				return allDayIds;
			},
			observe(getData, signal) {
				addChangeListener(
					ChangeType.ADD,
					{ type: ChangeEntityType.DAY },
					() => getData(),
					{ signal },
				);
			},
			observeState(getData, state, signal) {
				if (state.type === AsyncDataStateType.SUCCESS) {
					for (const id of state.data) {
						addChangeListener(
							ChangeType.DELETE,
							{ type: ChangeEntityType.DAY, id },
							() => getData(),
							{ signal },
						);
					}
				}
			},
		});
		liveAllDayIds.observe();
		return liveAllDayIds;
	}, []);

	return useLiveData(liveAllDayIds);
}
