import { useMemo } from 'preact/hooks';

import {
	AsyncDataStateType,
	useAsyncData,
	type AsyncDataState,
} from 'utils';

import { useAllDays } from './useAllDays';

/**
 * Attempts to load the IDs of all days immediately, sorted chronologically. Provides a {@linkcode AsyncDataState} representing the state of that loading operation.
 *
 * @see {@linkcode useAsyncData}
 */
export function useAllDayIds(): AsyncDataState<readonly number[]> {
	const daysAsyncDataResult = useAllDays();

	const asyncDataResult = useMemo(() => {
		if (daysAsyncDataResult.type !== AsyncDataStateType.SUCCESS) {
			return daysAsyncDataResult;
		}

		return {
			...daysAsyncDataResult,
			data: daysAsyncDataResult.data.map(({ id }) => id),
		};
	}, [daysAsyncDataResult]);

	return asyncDataResult;
}
