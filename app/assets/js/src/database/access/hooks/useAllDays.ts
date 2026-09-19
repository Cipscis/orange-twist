import { useEffect, useRef } from 'preact/hooks';

import { useAsyncData, type AsyncDataState } from 'utils';

import type { Day } from '../../types';
import { addListChangeListener, ChangeType } from '../liveAccessManager';
import { loadAllDays } from '../loadAllDays';

/**
 * Attempts to load all days immediately, Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useAllDays(): AsyncDataState<Day[]> {
	const asyncDataResult = useAsyncData(loadAllDays, { immediate: true });

	// Refresh if any days are added or removed
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addListChangeListener(
			ChangeType.DAY,
			asyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [asyncDataResult.getData]);

	// Don't re-enter loading state on re-requesting data
	const asyncDataResultStateRef = useRef(asyncDataResult.state);
	if (!asyncDataResult.state.loading) {
		asyncDataResultStateRef.current = asyncDataResult.state;
	}

	return asyncDataResultStateRef.current;
}
