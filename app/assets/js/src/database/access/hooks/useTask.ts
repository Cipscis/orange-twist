import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import { loadTask } from '../loadTask';
import { addTaskChangeListener } from '../liveAccessManager';

/**
 * Attempts to load a specified task immediately, and provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useTask(taskId: number): AsyncDataState<
	Awaited<ReturnType<typeof getTask>>
> {
	const getTask = useCallback(() => {
		return loadTask(taskId);
	}, [taskId]);

	const asyncDataResult = useAsyncData(getTask);

	useEffect(
		() => {
			const controller = new AbortController();
			const { signal } = controller;

			asyncDataResult.getData({ signal });

			return () => controller.abort();
		},
		// Deliberately only fetch data (or abort prior fetches) if `getTask` changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getTask]
	);

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addTaskChangeListener(
			taskId,
			asyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [taskId, asyncDataResult.getData]);

	return asyncDataResult.state;
}
