import { h } from 'preact';

import { useTasks } from '../registers/tasks/index.js';

import { TaskStatus } from '../types/TaskStatus.js';

import { TaskList } from './TaskList.js';

/**
 * Renders a list of all completed tasks inside a disclosure.
 */
export function CompletedTasksList() {
	const {
		data: tasks,
	} = useTasks();

	return tasks && <details class="orange-twist__section">
		<summary class="orange-twist__section-summary">
			<h2 class="orange-twist__title">Completed tasks</h2>
		</summary>

		<TaskList
			tasks={tasks.filter((task) => task.status === TaskStatus.COMPLETED)}
			className="orange-twist__task-list"
		/>
	</details>;
}
