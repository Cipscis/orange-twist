import { type JSX, h } from 'preact';
import type Preact from 'preact';
import {
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { getCurrentDateDayName } from 'utils';

import { useAllDayInfo } from 'data';

import { OrangeTwistContext } from '../OrangeTwistContext';
import { Accordion, Button } from '../shared';
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

	// Display a window of 7 days, collapse previous and future days
	const previousDays = days.slice(0, expandedDayIndex - 3);
	const [previousDaysOpen, setPreviousDaysOpen] = useState(false);
	const onPreviousDaysToggle = useCallback((event: Preact.TargetedEvent<HTMLDetailsElement, Event>) => {
		setPreviousDaysOpen(event.currentTarget.open);
	}, []);

	const currentDays = days.slice(expandedDayIndex - 3, expandedDayIndex + 4);

	const futureDays = days.slice(expandedDayIndex + 4);
	const [futureDaysOpen, setFutureDaysOpen] = useState(false);
	const onFutureDaysToggle = useCallback((event: Preact.TargetedEvent<HTMLDetailsElement, Event>) => {
		setFutureDaysOpen(event.currentTarget.open);
	}, []);

	return <section class="orange-twist__section">
		{!isLoading && days.length <= 1 && (
			<div class="content">
				<p>If you need help getting started, try <a href="/help">the help page</a>.</p>
			</div>
		)}

		{previousDays.length > 0 &&
			<Accordion
				class="orange-twist__section orange-twist__section--sticky-summary"
				summary={
					<h2 class="orange-twist__title">Previous days</h2>
				}
				onToggle={onPreviousDaysToggle}
			>
				{previousDaysOpen &&
					previousDays.map(((day) => (
						<Day
							key={day.name}
							day={day}
						/>
					)))
				}
			</Accordion>
		}

		<Accordion
			class="orange-twist__section"
			summary={
				<h2 class="orange-twist__title">Days</h2>
			}
			open
		>
			{currentDays.map((day) => (
				<Day
					key={day.name}
					day={day}
					open={day.name === currentDayName}
				/>
			))}
		</Accordion>

		{futureDays.length > 0 &&
			<Accordion
				class="orange-twist__section"
				summary={
					<h2 class="orange-twist__title">Future days</h2>
				}
				onToggle={onFutureDaysToggle}
			>
				{futureDaysOpen &&
					futureDays.map(((day) => (
						<Day
							key={day.name}
							day={day}
						/>
					)))
				}
			</Accordion>
		}

		<Button
			onClick={useCallback(() => fireCommand(Command.DAY_ADD_NEW), [])}
		>Add day</Button>
	</section>;
}
