import { dayRegister } from '../registers/dayRegister.js';

import './orange-twist-task-list.js';

class OrangeTwistDay extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const dayName = this.getAttribute('day');
		if (!dayName) {
			console.error('no day', this);
			return;
		}

		const day = dayRegister.get(dayName);
		if (!day) {
			console.error(`no day data for ${dayName}`);
			return;
		}

		const root = this;

		const header = document.createElement('h3');
		header.textContent = dayName;
		root.append(header);

		const tasksHeader = document.createElement('h4');
		tasksHeader.textContent = `Tasks (${day.tasks.length})`;
		root.append(tasksHeader);

		const taskList = document.createElement('ul', { is: 'orange-twist-task-list' });
		taskList.setAttribute('day', dayName);
		root.append(taskList);
	}

	disconnectedCallback() {
		// Remove all children
		this.replaceChildren();
	}
}

customElements.define('orange-twist-day', OrangeTwistDay);

export {};
