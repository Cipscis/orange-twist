import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import {
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Day } from '../../types';
import { addChangeListener, ChangeType } from '../liveAccessManager';
import { loadCurrentDay } from '../loadCurrentDay';

/**
 * Provides an {@linkcode AsyncDataState} that immediately requests the current day. If it doesn't already exist, then it will be constructed.
 */
export function useCurrentDay(): AsyncDataState<Day> {
	const [currentDayId, setCurrentDayId] = useState<number | null>(null);

	const getCurrentDay = useCallback(async () => {
		const currentDay = await loadCurrentDay();
		setCurrentDayId(currentDay.id);
		return currentDay;
	}, []);

	const asyncDataResult = useAsyncData(getCurrentDay, { immediate: true });

	// Re-fetch the data if it changes
	useEffect(() => {
		if (currentDayId === null) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		addChangeListener(
			ChangeType.DAY,
			currentDayId,
			asyncDataResult.getData,
			{ signal }
		);

		return () => controller.abort();
	}, [currentDayId, asyncDataResult.getData]);

	return asyncDataResult.state;
}
