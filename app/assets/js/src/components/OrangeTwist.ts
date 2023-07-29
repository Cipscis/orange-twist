import { h } from 'preact';
import htm from 'htm';

import { Day } from './Day.js';

import { useDaysList } from '../registers/days/index.js';
import { useUnfinishedTasksList } from '../registers/tasks/index.js';
import { addNewTask } from '../registers/tasks/tasksRegister.js';

// Initialise htm with Preact
const html = htm.bind(h);

export function OrangeTwist() {
	const daysList = useDaysList();
	const unfinishedTasksList = useUnfinishedTasksList();

	return html`<div>
		<h2>Days</h2>

		<ul>
			${daysList.map((dayName) => html`
				<li
					key="${dayName}"
				>
					<${Day} dayName="${dayName}" />
				</li>
			`)}
		</ul>

		<h2>Unfinished tasks</h2>

		<button type="button" onClick=${() => addNewTask()}>Add new task</button>

		<ul>
			${unfinishedTasksList.map((task) => html`<li key="${task.id}"><i>${task.id}</i> ${task.name} (${task.status})</li>`)}
		</ul>
	</div>`;
}
