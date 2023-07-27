import { taskRegister } from '../registers/taskRegister.js';

import './orange-twist-task.js';

class OrangeTwistTaskList extends HTMLUListElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const root = this;

		const dayName = root.getAttribute('day');

		const tasks = Array.from(taskRegister.keys());

		for (const task of tasks) {
			const item = document.createElement('li');

			const taskEl  = document.createElement('orange-twist-task');
			taskEl.setAttribute('task', String(task));
			if (dayName) {
				taskEl.setAttribute('day', dayName);
			}
			item.append(taskEl);

			root.append(item);
		}
	}

	disconnectedCallback() {
		// Remove all children
		this.replaceChildren();
	}
}

customElements.define('orange-twist-task-list', OrangeTwistTaskList, { extends: 'ul' });

export {};
