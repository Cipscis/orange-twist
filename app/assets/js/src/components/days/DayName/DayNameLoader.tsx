import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';
import type { Day } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';

import { DayNameSync } from './DayNameSync';

export interface DayNameLoaderProps {
	dayDataState: AsyncDataState<Day>;
}

/**
 * Renders an asynchronously loading {@linkcode DayNameSync} component, handling loading and error state.
 */
export function DayNameLoader(
	props: DayNameLoaderProps
): JSX.Element {
	const {
		dayDataState: dayDataState,
	} = props;

	if (dayDataState.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (dayDataState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayDataState.error.message}
		/>;
	}

	return <DayNameSync
		day={dayDataState.data}
	/>;
}
