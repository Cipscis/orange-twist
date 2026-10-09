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
 * Attempts to load a specified status immediately. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useStatus(statusId: number): AsyncDataState<Status> {
	const getStatus = useCallback(async () => {
		const status = await loadStatus(statusId);

		if (status === null) {
			throw new Error(`Could not find status with ID ${statusId}`);
		}

		return status;
	}, [statusId]);

	const asyncDataResult = useAsyncData(getStatus, { immediate: true });

	// No need to re-fetch status data, because it never changes

	return asyncDataResult.state;
}
