import { useCallback } from 'preact/hooks';

import { getDayData, setDayData, useDays } from '../registers/days/index.js';
import { useTasks } from '../registers/tasks/index.js';

import { Command, fireCommand } from '../registers/commands/index.js';

import { Note } from './shared/Note.js';
import { toast } from './shared/Toast.js';

import { TaskStatusComponent } from './TaskStatusComponent.js';

interface TaskDetailProps {
	taskId: number | null;
}

/**
 * Renders a detailed view for a task, including its notes.
 */
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

	const taskDayData = Object.fromEntries((days ?? []).map((day) => {
		if (!task) {
			return null;
		}

		const dayTask = structuredClone(day.tasks.find(({ id }) => id === taskId));
		if (!dayTask) {
			return null;
		}

		return [day.dayName, dayTask] as const;
	}).filter(
		(el): el is NonNullable<typeof el> => Boolean(el)
	));

	/**
	 * Update a task's note against a given day.
	 */
	const updateNoteForDay = useCallback((dayName: string, note: string) => {
		try {
			const dayData = getDayData(dayName);
			if (!dayData) {
				// TODO: Handle this error better
				throw new Error(`Tried to update note against ${dayName} but no such day exists`);
			}
			const dayTasks = dayData.tasks;
			const taskIndexForDay = dayTasks.findIndex(({ id }) => id === taskId);

			if (taskIndexForDay === -1) {
				// TODO: Should we add the task? We'd need to know what status to use if so
				throw new Error(`Task ${taskId} doesn't exist against ${dayName}`);
			}

			const taskForDay = dayTasks[taskIndexForDay];
			dayTasks.splice(taskIndexForDay, 1, {
				...taskForDay,
				note,
			});

			setDayData(dayName, { tasks: dayTasks });
		} catch (e) {
			toast(String(e));
		}
	}, [taskId]);

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

				{taskDayData &&
					<ul>
						{Object.entries(taskDayData).map(([dayName, dayTask]) => (
							<li
								key={dayName}
							>
								<h2>{dayName}</h2>
								<span>{dayTask.status}</span>
								<TaskStatusComponent
									task={task}
									dayName={dayName}
								/>
								<Note
									note={dayTask.note}
									onNoteChange={(note) => updateNoteForDay(dayName, note)}
									saveChanges={() => fireCommand(Command.DATA_SAVE)}
								/>
							</li>
						))}
					</ul>
				}
			</>
		}
	</>;
}
