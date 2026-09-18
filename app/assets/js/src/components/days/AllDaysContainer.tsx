import {
	h,
	type JSX,
} from 'preact';

import { useAllDays } from 'database';
import { AsyncDataStateType } from 'utils';

import { Loader } from 'components/shared';

import { AllDays } from './AllDays';

/**
 * Renders a list of all days.
 */
export function AllDaysContainer(): JSX.Element {
	const daysAsyncState = useAllDays();

	return <section class="orange-twist__section">
		{
			daysAsyncState.type === AsyncDataStateType.INITIAL &&
			<Loader />
		}
		{
			daysAsyncState.type === AsyncDataStateType.SUCCESS &&
			daysAsyncState.data &&
			<AllDays days={daysAsyncState.data} />
		}
		{/* Error state handled by `useAllDays` */}
	</section>;
}
