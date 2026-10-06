import {
	h,
	type JSX,
} from 'preact';

import { useDay } from 'database';

import type { DaySync, DaySyncProps } from './DaySync';
import { DayLoader } from './DayLoader';

export interface DayProps extends Omit<DaySyncProps, 'day'> {
	day: number;
}

/**
 * Loads a day, then displays that day via a {@linkcode DaySync} component.
 */
export function Day(props: DayProps): JSX.Element {
	const {
		day,
	} = props;

	const dayDataState = useDay(day);

	return <DayLoader
		{...props}
		dayDataState={dayDataState}
	/>;
}
