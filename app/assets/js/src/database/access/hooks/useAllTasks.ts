import { useMemo } from 'preact/hooks';

import {
	type AsyncActionState,
	useAsyncAction,
} from 'utils/asyncAction';

import type { Task } from '../../types';

import { LiveAllTasks } from '../LiveAllTasks';

/**
 * Attempts to load all tasks immediately, sorted according to their `sortIndex` property, and reloads the list if any tasks are added, changed, or removed in the database. Provides an {@linkcode AsyncActionState} representing the state of that loading operation.
 */
export function useAllTasks(): AsyncActionState<readonly Task[]> {
	const liveAllTasks = useMemo(() => {
		const liveAllTasks = new LiveAllTasks();
		liveAllTasks.observe();
		return liveAllTasks;
	}, []);

	return useAsyncAction(liveAllTasks);
}
