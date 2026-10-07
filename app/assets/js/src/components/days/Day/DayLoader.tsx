import {
	h,
	Fragment,
	type JSX,
} from 'preact';

import { AsyncDataStateType } from 'utils';
import type { useSettableDay } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';

import { DaySync, type DaySyncProps } from './DaySync';

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

	return <>
		{
			(dayDataState.stateOfGet.type === AsyncDataStateType.INITIAL) &&
			<Loader />
		}
		{
			dayDataState.stateOfGet.type === AsyncDataStateType.ERROR &&
			<Notice
				variant={NoticeVariant.ERROR}
				message={dayDataState.stateOfGet.error.message}
			/>
		}
		{dayDataState.stateOfGet.type === AsyncDataStateType.SUCCESS &&
			<DaySync
				{...props}
				day={dayDataState.stateOfGet.data}
				setDay={dayDataState.setData}
			/>
		}
	</>;
}
