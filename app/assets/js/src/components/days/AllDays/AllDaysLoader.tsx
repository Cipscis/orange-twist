import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';
import type { Day } from 'database';

import { Loader } from 'components/shared';

import { AllDaysSync } from './AllDaysSync';

export interface AllDaysLoaderProps {
	daysDataState: AsyncDataState<Day[]>;
	currentDayDataState: AsyncDataState<Day>;
}

/**
 * Renders an asynchronously loading {@linkcode AllDaysSync} component, handling loading and error state.
 */
export function AllDaysLoader(
	props: AllDaysLoaderProps
): JSX.Element {
	const {
		daysDataState,
		currentDayDataState,
	} = props;

	return <section class="orange-twist__section">
		{
			(
				daysDataState.type === AsyncDataStateType.INITIAL ||
				currentDayDataState.type === AsyncDataStateType.INITIAL
			) &&
			<Loader />
		}
		{
			daysDataState.type === AsyncDataStateType.SUCCESS &&
			daysDataState.data &&
			currentDayDataState.type === AsyncDataStateType.SUCCESS &&
			currentDayDataState.data &&
			<AllDaysSync
				days={daysDataState.data}
				currentDay={currentDayDataState.data}
			/>
		}
		{/* Error state handled by `useAllDays` */}
	</section>;
}
