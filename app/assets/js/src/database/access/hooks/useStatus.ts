import {
	useCallback,
	useEffect,
	useRef,
} from 'preact/hooks';

import {
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import { loadStatus } from '../loadStatus';

/**
 * Attempts to load a specified status immediately. Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useStatus(statusId: number): AsyncDataState<
	Awaited<ReturnType<typeof loadStatus>>
> {
	const getStatus = useCallback(() => {
		return loadStatus(statusId);
	}, [statusId]);

	const asyncDataResult = useAsyncData(getStatus);

	useEffect(
		() => {
			const controller = new AbortController();
			const { signal } = controller;

			asyncDataResult.getData({ signal });

			return () => controller.abort();
		},
		// Deliberately only fetch data (or abort prior fetches) if `getStatus` changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getStatus]
	);

	// No need to re-fetch status data, because it never changes

	// Don't re-enter loading state on re-requesting data
	const asyncDataResultStateRef = useRef(asyncDataResult.state);
	if (!asyncDataResult.state.loading) {
		asyncDataResultStateRef.current = asyncDataResult.state;
	}

	return asyncDataResultStateRef.current;
}
