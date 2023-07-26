import { TaskReference } from '../types/TaskReference.js';

import { taskRegister } from '../registers/taskRegister.js';

import { renderTaskStatus } from './renderTaskStatus.js';

export function renderTaskReference(taskRef: TaskReference): string {
	const task = taskRegister.get(taskRef.id);

	if (typeof task === 'undefined') {
		return '';
	}

	return `
<li class="task-list__item">
	<span>${task.name} ${renderTaskStatus(task.status)}</span>

	${taskRef.notes.map((note) => `
		<p>${note}</p>
	`).join('')}
</li>`;
}
