import { renderDay } from './renderDay.js';
import { renderTask } from './renderTask.js';

import { dayRegister } from '../registers/dayRegister.js';
import { taskRegister } from '../registers/taskRegister.js';
import { TaskStatus } from '../types/TaskStatus.js';

export function renderAppData(): string {
	const days = Array.from(
		dayRegister.entries()
	).sort(
		([a], [b]) => a.localeCompare(b)
	).map(([date, day]) => day);
	const unfinishedTaskIds = Array.from(
		taskRegister.entries()
	).filter(([id, task]) => task.status !== TaskStatus.COMPLETED).sort(
		([a], [b]) => a - b,
	).map(([id]) => id);

	return `
<div>
	<h2>Days</h2>
	<ul class="day-list">
		${days.map(renderDay).join('')}
	</ul>

	<h2>Unfinished tasks</h2>
	<ul class="task-list">
		${unfinishedTaskIds.map((id) => `
			<li class="task-list__item">
				${renderTask(id)}
			</li>
		`).join('')}
	</ul>
</div>`;
}
