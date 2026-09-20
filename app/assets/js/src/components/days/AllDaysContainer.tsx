import {
	h,
	type JSX,
} from 'preact';

import { useAllDays, useCurrentDay } from 'database';
import { AsyncDataStateType } from 'utils';

import { Loader } from 'components/shared';

import { AllDays } from './AllDays';

/**
 * Renders a list of all days.
 */
export function AllDaysContainer(): JSX.Element {
	const daysAsyncState = useAllDays();
	const currentDayAsyncState = useCurrentDay();

	return <section class="orange-twist__section">
		{
			(
				daysAsyncState.type === AsyncDataStateType.INITIAL ||
				currentDayAsyncState.type === AsyncDataStateType.INITIAL
			) &&
			<Loader />
		}
		{
			daysAsyncState.type === AsyncDataStateType.SUCCESS &&
			daysAsyncState.data &&
			currentDayAsyncState.type === AsyncDataStateType.SUCCESS &&
			currentDayAsyncState.data &&
			<AllDays
				days={daysAsyncState.data}
				currentDay={currentDayAsyncState.data}
			/>
		}
		{/* Error state handled by `useAllDays` */}
	</section>;
}
