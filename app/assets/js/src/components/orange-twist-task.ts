import { taskRegister } from '../registers/taskRegister.js';

import './orange-twist-task-status.js';

class OrangeTwistTask extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const root = this;

		const taskId = Number(this.getAttribute('task'));
		if (isNaN(taskId)) {
			console.error('no task', this);
			return;
		}
		const dayName = root.getAttribute('day');

		const task = taskRegister.get(taskId);
		if (!task) {
			console.error(`no task data for ${taskId}`);
			return;
		}

		const statusEl = document.createElement('orange-twist-task-status');
		const statusOnThisDay = (dayName && task.status.get(dayName)) || task.currentStatus;
		statusEl.setAttribute('status', statusOnThisDay);
		root.append(statusEl);

		const name = document.createElement('span');
		name.className = 'task__name';
		name.textContent = task.name;
		root.append(name);

		if (dayName) {
			const notesOnThisDay = task.notes.get(dayName);
			if (notesOnThisDay) {
				const notesEl = document.createElement('div');
				notesEl.className = 'task__notes';

				for (const note of notesOnThisDay) {
					const noteEl = document.createElement('p');
					noteEl.textContent = note;
					notesEl.append(noteEl);
				}

				root.append(notesEl);
			}
		}
	}
}

customElements.define('orange-twist-task', OrangeTwistTask);

export {};
