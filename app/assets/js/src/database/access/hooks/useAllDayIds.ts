import {
	useEffect,
	useMemo,
	useRef,
} from 'preact/hooks';

import {
	AsyncDataStateType,
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import { addListChangeListener, ChangeType } from '../liveAccessManager';
import { loadAllDays } from '../loadAllDays';

/**
 * Attempts to load the IDs of all days immediately, sorted chronologically. Provides an {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useAllDayIds(): AsyncDataState<readonly number[]> {
	const daysAsyncDataResult = useAsyncData(loadAllDays, { immediate: true });

	// Refresh if any days are added or removed
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addListChangeListener(
			ChangeType.DAY,
			daysAsyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [daysAsyncDataResult.getData]);

	const asyncDataResult: AsyncDataState<readonly number[]> = useMemo(() => {
		if (daysAsyncDataResult.state.type !== AsyncDataStateType.SUCCESS) {
			return daysAsyncDataResult.state;
		}

		return {
			...daysAsyncDataResult.state,
			data: daysAsyncDataResult.state.data.map(({ id }) => id),
		};
	}, [daysAsyncDataResult]);

	// Don't re-enter loading state on re-requesting data
	const asyncDataResultStateRef = useRef(asyncDataResult);
	if (!asyncDataResult.loading) {
		asyncDataResultStateRef.current = asyncDataResult;
	}

	return asyncDataResultStateRef.current;
}
