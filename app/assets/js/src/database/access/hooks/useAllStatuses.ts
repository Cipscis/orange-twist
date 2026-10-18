import {
	useEffect,
	useMemo,
	useState,
} from 'preact/hooks';

import {
	type AsyncDataState,
	LiveData,
} from 'utils/asyncData';

import type { Status } from '../../types';
import { loadAllStatuses } from '../loadAllStatuses';

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

	// Replicate most of useLiveData, but without cleanup since the same LiveData is reused across components so shouldn't be aborted etc.
	const [state, setState] = useState(liveStatuses.state);

	// Add necessary event listeners to update state
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		liveStatuses.addEventListener(
			'loadstart',
			() => setState(liveStatuses.state),
			{ signal },
		);

		liveStatuses.addEventListener(
			'loadend',
			() => setState(liveStatuses.state),
			{ signal },
		);

		return () => controller.abort();
	}, [liveStatuses]);

	return state;
}
