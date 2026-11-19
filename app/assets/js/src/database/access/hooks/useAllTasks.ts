import { useMemo } from 'preact/hooks';

import {
	type AsyncDataState,
	useLiveData,
} from 'utils/asyncData';

import type { Task } from '../../types';

import { LiveAllTasks } from '../LiveAllTasks';

/**
 * Attempts to load all tasks immediately, sorted according to their `sortIndex` property, and reloads the list if and tasks are added, changed, or removed in the database. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useAllTasks(): AsyncDataState<readonly Task[]> {
	const liveAllTasks = useMemo(() => {
		const liveAllTasks = new LiveAllTasks();
		liveAllTasks.observe();
		return liveAllTasks;
	}, []);

	return useLiveData(liveAllTasks);
}
