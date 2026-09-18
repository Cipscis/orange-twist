import { useAsyncData, type AsyncDataState } from 'utils';

import type { Day } from '../../types';
import { loadAllDays } from '../loadAllDays';

/**
 * Attempts to load all days immediately, Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useAllDays(): AsyncDataState<Day[]> {
	const asyncDataResult = useAsyncData(loadAllDays, { immediate: true });

	// TODO: Refresh if any days are added or removed

	return asyncDataResult.state;
}
