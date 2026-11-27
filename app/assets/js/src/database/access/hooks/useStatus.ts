import { useMemo } from 'preact/hooks';

import {
	type AsyncActionState,
	LiveData,
	useLiveData,
} from 'utils/asyncAction';

import type { Status } from '../../types';
import { loadStatus } from '../loadStatus';

/**
 * Attempts to load a specified status immediately. Provides an {@linkcode AsyncActionState} representing the state of that loading operation.
 */
export function useStatus(statusId: number): AsyncActionState<Status> {
	const liveStatus = useMemo(() => {
		const liveStatus = new LiveData(
			async function getData(_options) {
				const status = await loadStatus(statusId);

				if (status === null) {
					throw new Error(`Could not find status with ID ${statusId}`);
				}

				return status;
			},
			// No need to re-fetch status data, because it never changes
		);
		liveStatus.observe();
		return liveStatus;
	}, [statusId]);

	return useLiveData(liveStatus);
}
