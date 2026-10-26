import { useMemo } from 'preact/hooks';

import {
	useLiveData,
	type AsyncDataState,
} from 'utils/asyncData';

import { LiveCompletedTaskIds } from '../LiveCompletedTaskIds';

/**
 * Attempts to load a list of all task IDs for tasks with statuses that are marked as complete, in reverse chronological order according to the days associated with their canonical day tasks. Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useCompletedTaskIds(): AsyncDataState<readonly number[]> {
	const liveCompletedTaskIds = useMemo(() => {
		const liveDayTaskIds = new LiveCompletedTaskIds();

		liveDayTaskIds.observe();
		return liveDayTaskIds;
	}, []);

	return useLiveData(liveCompletedTaskIds);
}
