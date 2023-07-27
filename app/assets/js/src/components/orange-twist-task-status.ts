import { TaskStatus, isTaskStatus } from '../types/TaskStatus.js';
import { assertAllUnionMembersHandled } from '../util/index.js';

class OrangeTwistTaskStatus extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const root = this;

		const taskStatus = this.getAttribute('status');
		if (!isTaskStatus(taskStatus)) {
			throw new RangeError(`Invalid status ${taskStatus}`);
		}

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'task__status';
		button.title = taskStatus;
		if (taskStatus === TaskStatus.TODO) {
			button.textContent = '☐';
		} else if (taskStatus === TaskStatus.IN_PROGRESS) {
			button.textContent = '▶';
		} else if (taskStatus == TaskStatus.COMPLETED) {
			button.textContent = '☑';
		} else {
			assertAllUnionMembersHandled(taskStatus);
		}

		root.append(button);
		// TODO: Add event listener
	}
}

customElements.define('orange-twist-task-status', OrangeTwistTaskStatus);

export {};
