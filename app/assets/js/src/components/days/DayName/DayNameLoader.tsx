import {
	h,
	Fragment,
	type JSX,
} from 'preact';

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

	return <>
		{
			(dayDataState.type === AsyncDataStateType.INITIAL) &&
			<Loader />
		}
		{
			dayDataState.type === AsyncDataStateType.ERROR &&
			<Notice
				variant={NoticeVariant.ERROR}
				message={dayDataState.error.message}
			/>
		}
		{dayDataState.type === AsyncDataStateType.SUCCESS &&
			<DayNameSync
				day={dayDataState.data}
			/>
		}
	</>;
}
