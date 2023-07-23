import { DayList } from './types/DayList.js';
import { TaskStatus } from './types/TaskStatus.js';

(() => {
	const dayList: DayList = {
		days: [
			{
				date: new Date(2023, 7, 23),
				tasks: [
					{
						id: 1,
						name: 'Example task 2',
						notes: ['Example note'],
						status: TaskStatus.IN_PROGRESS,
					},
				],
			},
		],

		unfinished: [
			{
				id: 0,
				name: 'Example task',
				notes: [],
				status: TaskStatus.TODO,
			},
		],
	};

	function buildHtml(dayList: DayList): string {
		return `
<div>
	<h2>Days</h2>
	<ul class="day-list">
		${dayList.days.map((day) => `
			<li class="day-list__item">
				<h3>${String(day.date)}</h3>

				<h4>Tasks</h4>
				<ul class="task-list">
					${day.tasks.map((task) => `
						<li class="task-list__item">
							<h5>${task.name} (${task.status})</h5>

							${task.notes.map((note) => `
								<p>${note}</p>
							`).join('')}
						</li>
					`).join('')}
				</ul>
			</li>
		`).join('')}
	</ul>

	<h2>Unfinished tasks</h2>
	<ul class="task-list">
		${dayList.unfinished.map((task) => `
			<li class="task-list__item">
				<h3>${task.name} (${task.status})</h3>

				${task.notes.map((note) => `
					<p>${note}</p>
				`).join('')}
			</li>
		`).join('')}
	</ul>
</div>
	`;
	}

	const html = buildHtml(dayList);

	const main = document.getElementById('main');
	if (!main) {
		return;
	}

	main.innerHTML = html;
})();
