import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';
import type { Day } from 'database';

import { Loader } from 'components/shared';

import { AllDaysSync } from './AllDaysSync';

export interface AllDaysLoaderProps {
	dayIdsDataState: AsyncDataState<readonly number[]>;
	currentDayDataState: AsyncDataState<Day>;
}

/**
 * Renders an asynchronously loading {@linkcode AllDaysSync} component, handling loading and error state.
 */
export function AllDaysLoader(
	props: AllDaysLoaderProps
): JSX.Element {
	const {
		dayIdsDataState,
		currentDayDataState,
	} = props;

	return <section class="orange-twist__section">
		{
			(
				dayIdsDataState.type === AsyncDataStateType.INITIAL ||
				currentDayDataState.type === AsyncDataStateType.INITIAL
			) &&
			<Loader />
		}
		{
			dayIdsDataState.type === AsyncDataStateType.SUCCESS &&
			dayIdsDataState.data &&
			currentDayDataState.type === AsyncDataStateType.SUCCESS &&
			currentDayDataState.data &&
			<AllDaysSync
				dayIds={dayIdsDataState.data}
				currentDay={currentDayDataState.data}
			/>
		}
		{/* Error state handled by `useAllDays` */}
	</section>;
}
