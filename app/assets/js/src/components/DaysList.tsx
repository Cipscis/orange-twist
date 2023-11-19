import { h, type JSX } from 'preact';
import {
	useEffect,
	useMemo,
	useRef,
} from 'preact/hooks';

import { Command } from 'types/Command';

import { useDayInfo } from 'data/days';
import { fireCommand } from 'registers/commands';

import { DayComponent } from './DayComponent';

/**
 * Renders a list of days.
 */
export function DayList(): JSX.Element {
	const unsortedDays = useDayInfo();

	const days = useMemo(() => unsortedDays.sort(
		({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB)
	), [unsortedDays]);

	/**
	 * An object allowing each day's element to be looked
	 * up by its day name.
	 */
	const daySectionsRef = useRef<Record<string, HTMLDetailsElement | null>>({});

	/**
	 * An array of loaded days' names, used to compare
	 * between renders.
	 */
	const loadedDaysRef = useRef<ReadonlyArray<string> | null>(null);

	// Scroll to last day when days loads
	const scrolledToLastDay = useRef(false);
	useEffect(() => {
		if (scrolledToLastDay.current) {
			return;
		}

		if (days) {
			const lastDay = Object.values(daySectionsRef.current).at(-1);
			lastDay?.scrollIntoView({ behavior: 'instant' });
			scrolledToLastDay.current = true;
		}
	}, [days]);

	// Scroll to new day when created
	useEffect(() => {
		const loadedDays = days?.map(({ name }) => name) ?? null;
		const previouslyLoadedDays = loadedDaysRef.current;
		if (loadedDays && previouslyLoadedDays !== null) {
			// If days are loaded and days were already loaded
			const diff = loadedDays.filter(
				(dayName) => !previouslyLoadedDays.includes(dayName)
			);

			// If one new day was added, scroll to it and open it
			if (diff.length === 1) {
				const newDay = daySectionsRef.current[diff[0]];
				if (newDay) {
					newDay.scrollIntoView({ behavior: 'instant' });
					newDay.toggleAttribute('open', true);
				}
			}
		}

		loadedDaysRef.current = loadedDays;
	}, [days]);

	return <section class="orange-twist__section">
		<h2 class="orange-twist__title">Days</h2>
		{
			days && <>
				{days.map((day, i) => (
					<DayComponent
						key={day.name}
						ref={(ref: HTMLDetailsElement | null) => daySectionsRef.current[day.name] = ref}
						day={day}
						open={i === days.length-1}
					/>
				))}

				<button
					type="button"
					class="button"
					onClick={() => fireCommand(Command.DAY_ADD_NEW)}
				>Add day</button>
			</>
		}
	</section>;
}
