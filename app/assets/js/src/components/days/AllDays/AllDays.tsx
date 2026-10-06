import {
	h,
	type JSX,
} from 'preact';

import { useAllDayIds, useCurrentDay } from 'database';

import type { AllDaysSync } from './AllDaysSync';
import { AllDaysLoader } from './AllDaysLoader';

/**
 * Loads all days, and ensures today exists in the database, then displays all days via an {@linkcode AllDaysSync} component.
 */
export function AllDays(): JSX.Element {
	const dayIdsDataState = useAllDayIds();
	const currentDayDataState = useCurrentDay();

	return <AllDaysLoader
		dayIdsDataState={dayIdsDataState}
		currentDayDataState={currentDayDataState}
	/>;
}
