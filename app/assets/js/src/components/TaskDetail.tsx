import { useDays } from '../registers/days/index.js';
import { useTasks } from '../registers/tasks/index.js';

import { TaskStatusComponent } from './TaskStatusComponent.js';

interface TaskDetailProps {
	taskId: number | null;
}

export function TaskDetail(props: TaskDetailProps) {
	const {
		taskId,
	} = props;

	const {
		data: days,
		isLoading: isDaysLoading,
		error: daysError,
	} = useDays();

	const {
		data: tasks,
		isLoading: isTasksLoading,
		error: tasksError,
	} = useTasks();

	let error: string | null = null;

	const task = (() => {
		if (taskId === null) {
			error = 'No task ID specified';
			return null;
		}

		if (!tasks) {
			return null;
		}

		const task = tasks.find(({ id }) => id === taskId);
		if (!task) {
			error = `Could not find task with ID ${taskId}`;
			return null;
		}

		return task;
	})();

	const dayTasks = (days ?? []).map((day) => {
		if (!task) {
			return null;
		}

		const dayTask = day.tasks.find(({ id }) => id === taskId);
		if (!dayTask) {
			return null;
		}

		return [day.dayName, dayTask] as const;
	}).filter(
		(el): el is NonNullable<typeof el> => Boolean(el)
	);

	const isLoading = isDaysLoading || isTasksLoading;
	error = error ||
		daysError ||
		tasksError;

	return <>
		{
			isLoading &&
			<span class="orange-twist__loader" title="Loading" />
		}
		{
			error &&
			<span class="orange-twist__error">{error}</span>
		}
		{
			task &&
			<>
				<h1>{task.name}</h1>
				<span>({task.status})</span>

				{dayTasks &&
					<ul>
						{dayTasks.map(([dayName, dayTask]) => (
							<li
								key={dayName}
							>
								<h2>{dayName}</h2>
								<span>{dayTask.status}</span>
								<TaskStatusComponent
									task={task}
									dayName={dayName}
									readonly={true}
								/>
								<span>{dayTask.note}</span>
							</li>
						))}
					</ul>
				}
			</>
		}
	</>;
}
