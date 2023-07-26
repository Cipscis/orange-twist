import { formatDate } from '../formatters/date.js';
import { Day } from '../types/Day.js';
import { renderTask } from './renderTask.js';

export function renderDay(day: Day): string {
	return `
<li class="day-list__item">
	<h3>${formatDate(day.date)}</h3>

	<h4>Tasks</h4>
	<ul class="task-list">
		${day.tasks.map((taskRef) => `
			<li class="task-list__item">
				${renderTask(taskRef)}
			</li>`
		).join('')}
	</ul>
</li>`;
}
