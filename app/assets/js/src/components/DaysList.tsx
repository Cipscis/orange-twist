import { type JSX, h } from 'preact';
import { useMemo } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { useAllDayInfo } from 'data';

import { Button } from './shared/Button';
import { Day } from './Day';

/**
 * Renders a list of days.
 */
export function DayList(): JSX.Element {
	const unsortedDays = useAllDayInfo();

	const days = useMemo(() => unsortedDays.sort(
		({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB)
	), [unsortedDays]);

	return <section class="orange-twist__section">
		<h2 class="orange-twist__title">Days</h2>

		{days.map((day, i) => (
			<Day
				key={day.name}
				day={day}
				open={i === days.length-1}
			/>
		))}

		<Button
			onClick={() => fireCommand(Command.DAY_ADD_NEW)}
		>Add day</Button>
	</section>;
}
