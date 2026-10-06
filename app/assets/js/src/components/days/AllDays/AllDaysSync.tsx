import {
	h,
	Fragment,
	type JSX,
} from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

import type { Day } from 'database';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	AccordionScrollBehaviour,
	Button,
} from 'components/shared';
import { DaysListSync } from '../DaysList';

export interface AllDaysSyncProps {
	dayIds: readonly number[];
	currentDay: Day;
}

/**
 * Renders a list of all days, broken into three parts:
 *
 * - Past days
 * - Days (current days)
 * - Future days
 *
 * The past and future sections start collapsed, whereas the current days section starts expanded with the current day receiving focus. The current days section displays a window of 7 days centred around the current day.
 *
 * Also includes a button to add a new day.
 */
export function AllDaysSync(props: AllDaysSyncProps): JSX.Element {
	const {
		dayIds,
		currentDay,
	} = props;

	const currentDayIndex = dayIds.findIndex((id) => id === currentDay.id);

	const currentDaysWindowSize = 3;
	const currentDaysWindowStart = currentDayIndex - currentDaysWindowSize;
	const currentDaysWindowEnd = currentDayIndex + currentDaysWindowSize + 1;

	const previousDayIds = useMemo(() => {
		return dayIds.slice(0, currentDaysWindowStart);
	}, [dayIds, currentDaysWindowStart]);
	const currentDayIds = useMemo(() => {
		return dayIds.slice(currentDaysWindowStart, currentDaysWindowEnd);
	}, [dayIds, currentDaysWindowStart, currentDaysWindowEnd]);
	const futureDayIds = useMemo(() => {
		return dayIds.slice(currentDaysWindowEnd);
	}, [dayIds, currentDaysWindowEnd]);

	return <>
		{dayIds.length <= 1 && (
			<div class="content">
				<p>If you need help getting started, try <a href="/help">the help page</a>.</p>
			</div>
		)}

		{previousDayIds.length > 0 &&
			<DaysListSync
				dayIds={previousDayIds}
				title="Previous days"
				class="orange-twist__section orange-twist__section--sticky-summary"
				scrollBehaviour={AccordionScrollBehaviour.ANCHOR_BOTTOM}
			/>
		}

		<DaysListSync
			dayIds={currentDayIds}
			title="Days"
			class="orange-twist__section"
			selectedDayId={currentDay.id}
			open
		/>

		{futureDayIds.length > 0 &&
			<DaysListSync
				dayIds={futureDayIds}
				title="Future days"
				class="orange-twist__section orange-twist__section--sticky-summary"
			/>
		}

		<Button
			onClick={useCallback(() => fireCommand(Command.DAY_ADD_NEW), [])}
		>Add day</Button>
	</>;
}
