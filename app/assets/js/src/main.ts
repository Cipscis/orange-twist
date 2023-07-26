import { TaskStatus } from './types/TaskStatus.js';

import { renderAppData } from './renderers/renderAppData.js';

import { dayRegister } from './registers/dayRegister.js';
import { taskRegister } from './registers/taskRegister.js';
import { formatDate } from './formatters/date.js';

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

(() => {
	const html = renderAppData();

	const main = document.getElementById('main');
	if (!main) {
		return;
	}

	main.innerHTML = html;
})();
