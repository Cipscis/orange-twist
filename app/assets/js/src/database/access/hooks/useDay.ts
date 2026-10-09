import {
	useCallback,
	useEffect,
	useRef,
} from 'preact/hooks';

import {
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Day } from '../../types';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';
import { loadDay } from '../loadDay';

/**
 * Provides an {@linkcode AsyncDataState} that immediately requests a specified day.
 */
export function useDay(dayId: number): AsyncDataState<Day> {
	const getDay = useCallback(async () => {
		const day = await loadDay(dayId);

		if (day === null) {
			throw new Error(`Could not find day with ID ${dayId}`);
		}

		return day;
	}, [dayId]);

	const asyncDataResult = useAsyncData(getDay, { immediate: true });

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addChangeListener(
			ChangeType.CHANGE,
			ChangeEntityType.DAY,
			dayId,
			asyncDataResult.getData,
			{ signal }
		);

		return () => controller.abort();
	}, [dayId, asyncDataResult.getData]);

	// Don't re-enter loading state on re-requesting data
	const asyncDataResultStateRef = useRef(asyncDataResult.state);
	if (!asyncDataResult.state.loading) {
		asyncDataResultStateRef.current = asyncDataResult.state;
	}

	return asyncDataResultStateRef.current;
}
