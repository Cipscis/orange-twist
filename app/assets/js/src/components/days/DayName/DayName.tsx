import {
	h,
	type JSX,
} from 'preact';

import { useDay } from 'database';

import type { DayNameSync } from './DayNameSync';
import { DayNameLoader } from './DayNameLoader';

export interface DayNameProps {
	day: number;
}

/**
 * Loads a day, then displays that day via a {@linkcode DayNameSync} component.
 */
export function DayName(props: DayNameProps): JSX.Element {
	const {
		day,
	} = props;

	const dayDataState = useDay(day);

	return <DayNameLoader
		dayDataState={dayDataState}
	/>;
}
