import { taskRegister } from '../registers/taskRegister.js';
import { TaskReference } from '../types/TaskReference.js';
import { renderTaskStatus } from './renderTaskStatus.js';

export function renderTask(taskId: number): string
export function renderTask(taskRef: TaskReference): string
export function renderTask(taskIdOrRef: number | TaskReference): string
export function renderTask(taskIdOrRef: number | TaskReference): string {
	// First, consolidate arguments
	const [taskId, taskRef] = (() => {
		if (typeof taskIdOrRef === 'number') {
			return [taskIdOrRef, null];
		} else {
			return [taskIdOrRef.id, taskIdOrRef];
		}
	})();

	const task = taskRegister.get(taskId);
	if (typeof task === 'undefined') {
		return '';
	}

	const notes = taskRef?.notes ?? [];

	const subTasks = taskRef?.tasks ?? task.tasks;

	return `
	<div class="task js-task" data-task-id=${taskId}>
		<span class="task__status">${renderTaskStatus(task.status)}</span>

		<span class="task__name">${task.name}</span>

		${notes.length === 0 ? '' : `
			<div class="task__notes">
				${notes.map((note) => `
					<p>${note}</p>
				`).join('')}
			</div>
		`}

		${subTasks.length === 0 ? '' : `
			<ul class="task__subtasks">
				${subTasks.map((subTask) => `
					<li>${renderTask(subTask)}</li>
				`).join('')}
			</ul>
		`}
	</div>`;
}
