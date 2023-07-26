import { Day } from '../types/Day.js';
import { renderTaskReference } from './renderTaskReference.js';

export function renderDay(day: Day): string {
	return `
<li class="day-list__item">
	<h3>${String(day.date)}</h3>

	<h4>Tasks</h4>
	<ul class="task-list">
		${day.tasks.map(renderTaskReference).join('')}
	</ul>
</li>`;
}
