import { taskRegister } from '../registers/taskRegister.js';
import { TaskStatus } from '../types/TaskStatus.js';

import './orange-twist-day-list.js';
import './orange-twist-task.js';

export class OrangeTwist extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const root = this;

		const dayListHeader = document.createElement('h2');
		dayListHeader.textContent = 'Days';
		root.append(dayListHeader);

		const dayList = document.createElement('ul', { is: 'orange-twist-day-list' });
		dayList.className = 'day-list';
		dayList.setAttribute('test', 'string');
		root.append(dayList);

		const unfinishedTasks = Array.from(taskRegister.values()).filter((task) => task.getStatus() === TaskStatus.TODO);
		if (unfinishedTasks.length > 0) {
			const taskListHeader = document.createElement('h2');
			taskListHeader.textContent = 'Unfinished tasks';
			root.append(taskListHeader);

			const taskList = document.createElement('ul');
			taskList.className = 'task-list';
			for (const task of unfinishedTasks) {
				const taskListItem = document.createElement('li');
				taskList.append(taskListItem);

				const taskEl = document.createElement('orange-twist-task');
				taskEl.setAttribute('task', String(task.id));
				taskListItem.append(taskEl);
			}
			root.append(taskList);
		}
	}

	disconnectedCallback() {
		// Remove all children
		this.replaceChildren();
	}
}

customElements.define('orange-twist', OrangeTwist);

export {};
