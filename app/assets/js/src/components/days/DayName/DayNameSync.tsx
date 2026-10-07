import {
	h,
	Fragment,
	type JSX,
} from 'preact';

import type { Day } from 'database';

import { formatDayName } from 'formatters/dayName';

export interface DayNameSyncProps {
	day: Day;
}

/**
 * Renders a day's name.
 */
export const DayNameSync = (props: DayNameSyncProps): JSX.Element => {
	const {
		day,
	} = props;

	const name = formatDayName(day);

	return <>
		{name}
	</>;
};
