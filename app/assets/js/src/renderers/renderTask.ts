import { taskRegister } from '../registers/taskRegister.js';
import { renderTaskStatus } from './renderTaskStatus.js';

export function renderTask(taskId: number): string {
	const task = taskRegister.get(taskId);

	if (typeof task === 'undefined') {
		return '';
	}

	return `
<li class="task-list__item">
	<span>${task.name} ${renderTaskStatus(task.status)}</span>
</li>`;
}
