import {
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Status } from '../../types';
import { loadAllStatuses } from '../loadAllStatuses';

/**
 * Attempts to load all statuses immediately. Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useAllStatuses(): AsyncDataState<Status[]> {
	const asyncDataResult = useAsyncData(loadAllStatuses, { immediate: true });

	return asyncDataResult.state;
}
