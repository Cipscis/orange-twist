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
import { DaysList } from './DaysList';

export interface AllDaysProps {
	days: readonly Day[];
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
export function AllDays(props: AllDaysProps): JSX.Element {
	const {
		days,
		currentDay,
	} = props;

	const currentDayIndex = days.findIndex(({ id }) => id === currentDay.id);

	const currentDaysWindowSize = 3;
	const currentDaysWindowStart = currentDayIndex - currentDaysWindowSize;
	const currentDaysWindowEnd = currentDayIndex + currentDaysWindowSize + 1;

	const previousDays = useMemo(() => {
		return days.slice(0, currentDaysWindowStart);
	}, [days, currentDaysWindowStart]);
	const currentDays = useMemo(() => {
		return days.slice(currentDaysWindowStart, currentDaysWindowEnd);
	}, [days, currentDaysWindowStart, currentDaysWindowEnd]);
	const futureDays = useMemo(() => {
		return days.slice(currentDaysWindowEnd);
	}, [days, currentDaysWindowEnd]);

	return <>
		{days.length <= 1 && (
			<div class="content">
				<p>If you need help getting started, try <a href="/help">the help page</a>.</p>
			</div>
		)}

		{previousDays.length > 0 &&
			<DaysList
				days={previousDays}
				title="Previous days"
				class="orange-twist__section orange-twist__section--sticky-summary"
				scrollBehaviour={AccordionScrollBehaviour.ANCHOR_BOTTOM}
			/>
		}

		<DaysList
			days={currentDays}
			title="Days"
			class="orange-twist__section"
			selectedDayId={currentDay.id}
			open
		/>

		{futureDays.length > 0 &&
			<DaysList
				days={futureDays}
				title="Future days"
				class="orange-twist__section orange-twist__section--sticky-summary"
			/>
		}

		<Button
			onClick={useCallback(() => fireCommand(Command.DAY_ADD_NEW), [])}
		>Add day</Button>
	</>;
}
