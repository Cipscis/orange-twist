import { h, type JSX } from 'preact';

import { useTaskInfo } from '../registers/tasks';

import { TaskStatus } from '../types/TaskStatus';

import { TaskList } from './TaskList';

/**
 * Renders a list of all completed tasks inside a disclosure.
 */
export function CompletedTasksList(): JSX.Element | null {
	const tasks = useTaskInfo();

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
