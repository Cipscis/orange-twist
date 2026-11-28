import { useMemo } from 'preact/hooks';

import {
	AsyncActionStateType,
	type AsyncActionState,
	LiveData,
	useAsyncAction,
} from 'utils/asyncAction';

import type { Day } from '../../types';

import { loadCurrentDay } from '../loadCurrentDay';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';

/**
 * Provides an {@linkcode AsyncActionState} that immediately requests the current day. If it doesn't already exist, then it will be constructed.
 */
export function useCurrentDay(): AsyncActionState<Day> {
	const liveCurrentDay = useMemo(() => {
		const liveCurrentDay = new LiveData(
			async function getData(_options) {
				const currentDay = await loadCurrentDay();
				return currentDay;
			},
			{
				observeState(getDataArg, state, signal) {
					if (state.type === AsyncActionStateType.SUCCESS) {
						const getData = () => getDataArg();
						const changeEntity = { type: ChangeEntityType.DAY, id: state.data.id };

						addChangeListener(
							ChangeType.CHANGE,
							changeEntity,
							getData,
							{ signal }
						);
						addChangeListener(
							ChangeType.DELETE,
							changeEntity,
							getData,
							{ signal }
						);
					}
				},
			}
		);
		liveCurrentDay.observe();
		return liveCurrentDay;
	}, []);

	return useAsyncAction(liveCurrentDay);
}
