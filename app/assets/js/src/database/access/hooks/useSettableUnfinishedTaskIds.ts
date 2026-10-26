import { useMemo } from 'preact/hooks';

import {
	useSettableLiveData,
	type UseSettableLiveDataResult,
} from 'utils/asyncData';

import { LiveSettableUnfinishedTaskIds } from '../LiveSettableUnfinishedTaskIds';

/**
 * Attempts to load a list of all task IDs for tasks with statuses that aren't marked as complete, sorted by those tasks' sort indices, and provides a method of updating their sort indices. Provides a {@linkcode UseSettableLiveDataResult} representing the states of that loading operation and any setting operations.
 */
export function useSettableUnfinishedTaskIds(): UseSettableLiveDataResult<readonly number[]> {
	const liveSettableUnfinishedTaskIds = useMemo(() => {
		const liveDayTaskIds = new LiveSettableUnfinishedTaskIds();

		liveDayTaskIds.observe();
		return liveDayTaskIds;
	}, []);

	return useSettableLiveData(liveSettableUnfinishedTaskIds);
}
