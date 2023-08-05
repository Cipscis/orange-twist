import { h } from 'preact';
import htm from 'htm';
import { useCallback } from 'preact/hooks';

import { Day } from '../types/Day.js';
import { deleteDay } from '../registers/days/index.js';
import { getTaskData } from '../registers/tasks/index.js';

import { DayNote, DayNoteProps } from './DayNote.js';
import { TaskComponent, TaskComponentProps } from './TaskComponent.js';

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

		${
			day.tasks.length > 0 &&
			html`<div class="day__tasks">
				${day.tasks.map((task) => {
					const taskData = getTaskData(task.id);
					if (!taskData) {
						return '';
					}

					if (taskData) {
						const taskComponentProps: TaskComponentProps = {
							task: { ...taskData, ...task },
							dayName,
						};
						return html`<${TaskComponent} ...${taskComponentProps} />`;
					}
				})}
			</div>`
		}
	</div>`;
}
