import { h, type JSX } from 'preact';

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

	if (dayDataState.stateOfGet.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (dayDataState.stateOfGet.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayDataState.stateOfGet.error.message}
		/>;
	}

	return <DaySync
		{...props}
		day={dayDataState.stateOfGet.data}
		setDay={dayDataState.setData}
	/>;
}
