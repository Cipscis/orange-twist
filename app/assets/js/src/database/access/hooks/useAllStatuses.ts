import {
	AsyncDataStateType,
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Status } from '../../types';
import { loadAllStatuses } from '../loadAllStatuses';

// An in-memory cache of statuses, used to load directly into success state if it's already been fetched
let statuses: readonly Status[] | null = null;

/**
 * Attempts to load all statuses immediately. Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useAllStatuses(): AsyncDataState<readonly Status[]> {
	const asyncDataResult = useAsyncData(loadAllStatuses, { immediate: true });

	if (statuses !== null) {
		return {
			type: AsyncDataStateType.SUCCESS,
			data: statuses,
			loading: false,
		};
	}

	if (asyncDataResult.state.type === AsyncDataStateType.SUCCESS) {
		statuses = asyncDataResult.state.data;
	}

	return asyncDataResult.state;
}
