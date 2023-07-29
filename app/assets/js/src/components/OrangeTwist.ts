import { h } from 'preact';
import htm from 'htm';

import { Day } from './Day.js';

import { useDaysList } from '../registers/days/index.js';

// Initialise htm with Preact
const html = htm.bind(h);

export function OrangeTwist() {
	const daysList = useDaysList();

	return html`<div>
		<h2>Days</h2>

		<ul>
			${daysList.map((dayName) => html`
				<li
					key=${dayName}
				>
					<${Day} dayName=${dayName} />
				</li>
			`)}
		</ul>
	</div>`;
}
