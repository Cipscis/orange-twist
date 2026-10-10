import {
	useCallback,
	useEffect,
	useRef,
} from 'preact/hooks';

import {
	AsyncDataStateType,
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import type { Day } from '../../types';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
	type ChangeEntity,
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

		const changeEntity: ChangeEntity = {
			type: ChangeEntityType.DAY,
			id: dayId,
		};

		if (asyncDataResult.state.type === AsyncDataStateType.ERROR) {
			addChangeListener(
				ChangeType.ADD,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);
		} else if (asyncDataResult.state.type === AsyncDataStateType.SUCCESS) {
			addChangeListener(
				ChangeType.CHANGE,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);

			addChangeListener(
				ChangeType.DELETE,
				changeEntity,
				asyncDataResult.getData,
				{ signal },
			);
		}

		return () => controller.abort();
	}, [dayId, asyncDataResult]);

	return asyncDataResult.state;
}
