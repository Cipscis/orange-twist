import { useMemo } from 'preact/hooks';

import {
	type AsyncDataState,
	useLiveData,
} from 'utils/asyncData';

import { LiveUnfinishedTaskIds } from '../LiveUnfinishedTaskIds';

/**
 * Attempts to load a list of all task IDs for tasks with statuses that aren't marked as complete, sorted by those tasks' sort indices. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useUnfinishedTaskIds(): AsyncDataState<readonly number[]> {
	const liveUnfinishedTaskIds = useMemo(() => {
		const liveDayTaskIds = new LiveUnfinishedTaskIds();

		liveDayTaskIds.observe();
		return liveDayTaskIds;
	}, []);

	return useLiveData(liveUnfinishedTaskIds);
}
