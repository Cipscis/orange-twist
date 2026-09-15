import {
	useCallback,
	useRef,
} from 'preact/hooks';

import {
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Status } from '../../types';
import { loadStatus } from '../loadStatus';

/**
 * Attempts to load a specified status immediately. Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useStatus(statusId: number): AsyncDataState<Status | null> {
	const getStatus = useCallback(() => {
		return loadStatus(statusId);
	}, [statusId]);

	const asyncDataResult = useAsyncData(getStatus, { immediate: true });

	// No need to re-fetch status data, because it never changes

	// Don't re-enter loading state on re-requesting data
	const asyncDataResultStateRef = useRef(asyncDataResult.state);
	if (!asyncDataResult.state.loading) {
		asyncDataResultStateRef.current = asyncDataResult.state;
	}

	return asyncDataResultStateRef.current;
}
