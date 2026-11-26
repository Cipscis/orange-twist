import { h, type JSX } from 'preact';

import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncData';
import type { Day } from 'database';

import { Loader } from 'components/shared';

import { AllDaysSync } from './AllDaysSync';

export interface AllDaysLoaderProps {
	dayIdsDataState: AsyncActionState<readonly number[]>;
	currentDayDataState: AsyncActionState<Day>;
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
				dayIdsDataState.type === AsyncActionStateType.INITIAL ||
				currentDayDataState.type === AsyncActionStateType.INITIAL
			) &&
			<Loader />
		}
		{
			dayIdsDataState.type === AsyncActionStateType.SUCCESS &&
			currentDayDataState.type === AsyncActionStateType.SUCCESS &&
			<AllDaysSync
				dayIds={dayIdsDataState.data}
				currentDay={currentDayDataState.data}
			/>
		}
		{/* Error state handled by `useAllDays` */}
	</section>;
}
