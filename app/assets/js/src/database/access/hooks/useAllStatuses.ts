import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import { loadAllStatuses } from '../loadAllStatuses';

/**
 * Attempts to load all statuses immediately. Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useAllStatuses(): AsyncDataState<
	Awaited<ReturnType<typeof loadAllStatuses>>
> {
	const getStatus = useCallback(() => {
		return loadAllStatuses();
	}, []);

	const asyncDataResult = useAsyncData(getStatus);

	useEffect(
		() => {
			const controller = new AbortController();
			const { signal } = controller;

			asyncDataResult.getData({ signal });

			return () => controller.abort();
		},
		// Deliberately only fetch data on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	// No need to re-fetch status data, because it never changes

	return asyncDataResult.state;
}
