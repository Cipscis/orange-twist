import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import htm from 'htm';

import { isValidDateString } from '../util/date/isValidDateString.js';

import { Day, DayProps } from './Day.js';

import { getDayData, saveDays, setDayData, useDaysList } from '../registers/days/index.js';
import { addNewTask, useUnfinishedTasksList } from '../registers/tasks/index.js';

// Initialise htm with Preact
const html = htm.bind(h);

export function OrangeTwist() {
	const daysList = useDaysList();
	const unfinishedTasksList = useUnfinishedTasksList();

	const addNewDay = useCallback(() => {
		const dayName = window.prompt('What day?');
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			// TODO: Handle error
			window.alert('Invalid day');
			return;
		}

		const existingDayData = getDayData(dayName);
		if (existingDayData) {
			// TODO: Handle error
			window.alert('Day already exists');
			return;
		}

		setDayData(dayName, {});
	}, []);

	return html`<div>
		<h2>Days</h2>

		<ul>
			${daysList.map((dayName) => {
				const dayProps: DayProps = { dayName };
				return html`
					<li
						key="${dayName}"
					>
						<${Day} ...${dayProps} />
					</li>
				`;
			})}
		</ul>

		<button type="button" onClick="${addNewDay}">Add day</button>

		<h2>Unfinished tasks</h2>

		<button type="button" onClick="${() => addNewTask()}">Add new task</button>

		<ul>
			${unfinishedTasksList.map((task) => html`<li key="${task.id}"><i>${task.id}</i> ${task.name} (${task.status})</li>`)}
		</ul>

		<button type="button" onClick="${() => saveDays()}">Save data</button>
	</div>`;
}
