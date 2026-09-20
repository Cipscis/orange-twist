import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import {
	getCurrentDate,
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Day } from '../../types';
import { save } from '../save';
import { SaveType } from '../SaveAction';
import { addChangeListener, ChangeType } from '../liveAccessManager';
import { loadDayByDate } from '../loadDayByDate';

/**
 * Provides a {@linkcode AsyncDataState} that immediately requests the current day. If it doesn't already exist, then it will be constructed.
 */
export function useCurrentDay(): AsyncDataState<Day> {
	const [currentDayId, setCurrentDayId] = useState<number | null>(null);

	const getCurrentDay = useCallback(async () => {
		const currentDate = getCurrentDate();
		let currentDay = await loadDayByDate(currentDate);

		// If today already exists, provide it right away
		if (currentDay) {
			setCurrentDayId(currentDay.id);
			return currentDay;
		}

		// Otherwise, create today then retrieve it again
		// Calling `save` directly avoids displaying a "Saved" alert
		await save([{
			type: SaveType.DAY_ADD,
			day: {
				...currentDate,
				note: '',
			},
		}]);

		currentDay = await loadDayByDate(currentDate);

		if (!currentDay) {
			throw new Error('Something went wrong with creating the current day');
		}

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
