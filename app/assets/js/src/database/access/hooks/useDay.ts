import { useMemo } from 'preact/hooks';

import type { AsyncDataState } from 'utils';

import type { Day } from '../../types';

import { ChangeEntityType } from '../liveAccessManager';
import { ObservableEntity } from '../ObservableEntity';
import { useLiveData } from './useLiveData';

/**
 * Attempts to load a specified day immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useDay(dayId: number): AsyncDataState<Day> {
	const liveDay = useMemo(() => {
		const liveDay = new ObservableEntity({
			type: ChangeEntityType.DAY,
			id: dayId,
		});
		liveDay.observe();
		return liveDay;
	}, [dayId]);

	return useLiveData(liveDay);
}
