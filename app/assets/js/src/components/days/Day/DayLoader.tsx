import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';
import type { Day } from 'database';

import { Loader } from 'components/shared';

import type { DaySyncProps } from './DaySync';
import { DaySync } from './DaySync';

export interface DayLoaderProps extends Omit<DaySyncProps, 'day'> {
	dayDataState: AsyncDataState<Day>;
}

/**
 * Renders an asynchronously loading {@linkcode DaySync} component, handling loading and error state.
 */
export function DayLoader(
	props: DayLoaderProps
): JSX.Element {
	const {
		dayDataState: dayDataState,
	} = props;

	return <section class="orange-twist__section">
		{
			(dayDataState.type === AsyncDataStateType.INITIAL) &&
			<Loader />
		}
		{dayDataState.type === AsyncDataStateType.SUCCESS &&
			<DaySync
				{...props}
				day={dayDataState.data}
			/>
		}
		{/* TODO: Handle error state */}
	</section>;
}
