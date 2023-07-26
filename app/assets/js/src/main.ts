import { AppData } from './types/AppData.js';
import { TaskStatus } from './types/TaskStatus.js';

import { renderAppData } from './renderers/renderAppData.js';

import { taskRegister } from './registers/taskRegister.js';

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
	const appData: AppData = {
		days: [
			{
				date: new Date(2023, 7, 23),
				tasks: [{
					id: 1,
					notes: ['Example note'],
					status: TaskStatus.IN_PROGRESS,
					tasks: [],
				}],
			},
		],

		unfinished: [0],
	};

	const html = renderAppData(appData);

	const main = document.getElementById('main');
	if (!main) {
		return;
	}

	main.innerHTML = html;
})();
