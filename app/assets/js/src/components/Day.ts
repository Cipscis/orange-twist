import { h } from 'preact';
import htm from 'htm';
import { useDay } from '../registers/days/index.js';

// Initialise htm with Preact
const html = htm.bind(h);

interface DayProps {
	dayName: string;
}

export function Day(props: DayProps) {
	const day = useDay(props.dayName);

	if (day === null) {
		return null;
	}

	return html`<div class="day">
		<h3 class="day__heading">${day.date}</h3>

		<div class="day__notes">${day.note.split('\n').map((paragraph, i) => html`<p key="${i}">${paragraph}</p>`)}</div>

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
