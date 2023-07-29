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

	return html`<div>
		<h3>${day.date}</h3>

		<p>${day.note}</p>
	</div>`;
}
