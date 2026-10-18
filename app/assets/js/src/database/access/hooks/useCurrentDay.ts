import { useMemo } from 'preact/hooks';

import {
	AsyncDataStateType,
	type AsyncDataState,
	LiveData,
	useLiveData,
} from 'utils/asyncData';

import type { Day } from '../../types';

import { loadCurrentDay } from '../loadCurrentDay';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

/**
 * Provides an {@linkcode AsyncDataState} that immediately requests the current day. If it doesn't already exist, then it will be constructed.
 */
export function useCurrentDay(): AsyncDataState<Day> {
	const liveCurrentDay = useMemo(() => {
		const liveCurrentDay = new LiveData({
			async getData(_options) {
				const currentDay = await loadCurrentDay();
				return currentDay;
			},
			observeState(getData, state, signal) {
				if (state.type === AsyncDataStateType.SUCCESS) {
					addChangeListener(
						ChangeType.CHANGE,
						{ type: ChangeEntityType.DAY, id: state.data.id },
						() => getData(),
						{ signal }
					);
				}
			},
		});
		liveCurrentDay.observe();
		return liveCurrentDay;
	}, []);

	return useLiveData(liveCurrentDay);
}
