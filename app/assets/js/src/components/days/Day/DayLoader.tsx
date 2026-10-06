import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils';
import type { useSettableDay } from 'database';

import { Loader } from 'components/shared';

import type { DaySyncProps } from './DaySync';
import { DaySync } from './DaySync';

export interface DayLoaderProps extends Omit<DaySyncProps, 'day' | 'setDay'> {
	dayDataState: ReturnType<typeof useSettableDay>;
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
			(dayDataState.stateOfGet.type === AsyncDataStateType.INITIAL) &&
			<Loader />
		}
		{dayDataState.stateOfGet.type === AsyncDataStateType.SUCCESS &&
			<DaySync
				{...props}
				day={dayDataState.stateOfGet.data}
				setDay={dayDataState.setData}
			/>
		}
		{/* TODO: Handle error state */}
	</section>;
}
