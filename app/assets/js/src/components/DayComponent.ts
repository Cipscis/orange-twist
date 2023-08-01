import { h } from 'preact';
import htm from 'htm';
import { useCallback } from 'preact/hooks';

import { Day } from '../types/Day.js';
import { deleteDay } from '../registers/days/index.js';

import { DayNote, DayNoteProps } from './DayNote.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface DayProps {
	day: Readonly<Day>;
}

export function DayComponent(props: DayProps) {
	const { day } = props;
	const { dayName } = day;

	const removeDay = useCallback((dayName: string) => {
		if (!window.confirm('Are you sure?')) {
			return;
		}

		deleteDay(dayName);
	}, []);

	const dayNoteProps: DayNoteProps = { day };

	return html`<div class="day">
		<h3 class="day__heading">${day.dayName}</h3>

		<button type="button" onClick="${() => removeDay(dayName)}">Remove day</button>

		<div class="day__notes">
			<${DayNote} ...${dayNoteProps} />
		</div>

		${day.sections.length > 0 && html`
			<div class="day__sections">
				${day.sections.map((section) => html`
					<div class="day__section" key="${section.name}">
						<h4 class="day__section-heading">${section.name}</h4>
					</div>
				`)}
			</div>
		`}
	</div>`;
}
