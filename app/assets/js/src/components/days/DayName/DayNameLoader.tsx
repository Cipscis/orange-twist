import { h, type JSX } from 'preact';

import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncData';
import type { Day } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';

import { DayNameSync } from './DayNameSync';

export interface DayNameLoaderProps {
	dayDataState: AsyncActionState<Day>;
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

	if (dayDataState.type === AsyncActionStateType.INITIAL) {
		return <Loader />;
	}

	if (dayDataState.type === AsyncActionStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayDataState.error.message}
		/>;
	}

	return <DayNameSync
		day={dayDataState.data}
	/>;
}
