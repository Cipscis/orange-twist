import { type JSX, h } from 'preact';
import {
	useCallback,
	useContext,
	useMemo,
} from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { getCurrentDateDayName } from 'utils';

import { useAllDayInfo } from 'data';

import { OrangeTwistContext } from '../OrangeTwistContext';
import { Button } from '../shared';
import { Day } from './Day';

/**
 * Renders a list of days.
 */
export function DaysList(): JSX.Element {
	const unsortedDays = useAllDayInfo();

	const { isLoading } = useContext(OrangeTwistContext);

	const days = useMemo(() => unsortedDays.toSorted(
		({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB)
	), [unsortedDays]);

	const currentDayName = getCurrentDateDayName();

	const expandedDayIndex = useMemo(
		() => {
			// If the days list includes the current day, expand it
			const currentDayIndex = days.findIndex(
				({ name }) => name === currentDayName
			);

			if (currentDayIndex !== -1) {
				return currentDayIndex;
			}

			// Otherwise, expand the last day
			return days.length - 1;
		},
		[days, currentDayName]
	);

	return <section class="orange-twist__section">
		<h2 class="orange-twist__title">Days</h2>

		{!isLoading && days.length <= 1 && (
			<div class="content">
				<p>If you need help getting started, try <a href="/help">the help page</a>.</p>
			</div>
		)}

		{days.map((day, i) => (
			<Day
				key={day.name}
				day={day}
				open={i === expandedDayIndex}
			/>
		))}

		<Button
			onClick={useCallback(() => fireCommand(Command.DAY_ADD_NEW), [])}
		>Add day</Button>
	</section>;
}
