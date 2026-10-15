import { useMemo } from 'preact/hooks';

import type { AsyncDataState } from 'utils';

import type { Status } from '../../types';
import { loadAllStatuses } from '../loadAllStatuses';

import { LiveData } from '../LiveData';
import { useLiveData } from './useLiveData';

// An in-memory cache of statuses, used to load directly into success state if it's already been fetched
let statuses: readonly Status[] | null = null;

/**
 * Once loaded once, the same {@linkcode LiveData} is reused across all uses.
 */
let liveStatusesGlobal: LiveData<readonly Status[]> | null = null;

/**
 * Attempts to load all statuses immediately. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 */
export function useAllStatuses(): AsyncDataState<readonly Status[]> {
	const liveStatuses = useMemo(() => {
		if (liveStatusesGlobal !== null) {
			return liveStatusesGlobal;
		}

		liveStatusesGlobal = new LiveData({
			async getData(_options) {
				if (statuses === null) {
					statuses = await loadAllStatuses();
				}
				return statuses;
			},
			// No need to re-fetch status data, because it never changes
		});
		liveStatusesGlobal.observe();
		return liveStatusesGlobal;
	}, []);

	return useLiveData(liveStatuses);
}
