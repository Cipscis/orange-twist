import { TaskStatus } from './types/TaskStatus.js';

import { renderAppData } from './renderers/renderAppData.js';

import { dayRegister } from './registers/dayRegister.js';
import { taskRegister } from './registers/taskRegister.js';
import { formatDate } from './formatters/date.js';
import { assertAllUnionMembersHandled } from './util/index.js';

const Selector = {
	DAY: '.js-day',
	TASK: '.js-task',
	TASK_STATUS: '.js-task__status',
} as const;

const DataAttribute = {
	TASK_ID: 'data-task-id',
} as const;

function initStaticTestData() {
	dayRegister.set(formatDate(new Date()), {
		date: new Date(),
		tasks: [{
			id: 1,
			status: TaskStatus.IN_PROGRESS,
			notes: ['Example note'],
			tasks: [{
				id: 0,
				status: TaskStatus.TODO,
				notes: [],
				tasks: [],
			}],
		}],
	});

	taskRegister.set(1, {
		id: 1,
		name: 'Example task 2',
		status: TaskStatus.IN_PROGRESS,

		tasks: [],
	});
	taskRegister.set(0, {
		id: 0,
		name: 'Example task',
		status: TaskStatus.TODO,

		tasks: [],
	});
}

function renderApp() {
	const html = renderAppData();

	const main = document.getElementById('main');
	if (!main) {
		return;
	}

	main.innerHTML = html;
}

(() => {
	initStaticTestData();

	renderApp();

	const main = document.getElementById('main');
	if (!main) {
		return;
	}

	main.addEventListener('click', (e) => {
		const target = (e.target instanceof Element) && e.target.closest(Selector.TASK_STATUS);
		if (!target) {
			return;
		}

		const taskEl = target.closest(Selector.TASK);
		if (!taskEl) {
			// TODO: Handle error
			console.error('Can\'t find closest task element');
			return;
		}

		const taskId = parseInt(taskEl.getAttribute(DataAttribute.TASK_ID) ?? '', 10);
		const task = taskRegister.get(taskId);
		if (!task) {
			// TODO: Handle error
			console.error(`Can't find task with id ${taskId}`);
			return;
		}

		if (task.status === TaskStatus.TODO) {
			task.status = TaskStatus.IN_PROGRESS;
		} else if (task.status === TaskStatus.IN_PROGRESS) {
			task.status = TaskStatus.COMPLETED;
		} else if (task.status === TaskStatus.COMPLETED) {
			task.status = TaskStatus.TODO;
		} else {
			assertAllUnionMembersHandled(task.status);
		}

		renderApp();
	});
})();
