import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { Command } from 'types/Command';

import { getDayData, setDayData, useDays } from 'registers/days';
import { useTasks } from 'registers/tasks';

import { fireCommand } from 'registers/commands';

import { Note } from './shared/Note';
import { toast } from './shared/Toast';

import { TaskStatusComponent } from './TaskStatusComponent';
import { Markdown } from './shared/Markdown';

interface TaskDetailProps {
	taskId: number | null;
}

/**
 * Renders a detailed view for a task, including its notes.
 */
export function TaskDetail(props: TaskDetailProps): JSX.Element {
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
			<section class="orange-twist__section">
				<Markdown class="orange-twist__title" content={`## ${task.name}`} inline />

				{
					isLoading &&
					// TODO: Make loader component
					<span class="orange-twist__loader" title="Loading" />
				}
				{
					error &&
					// TODO: Handle error better somehow
					// TODO: Make error component
					<span class="orange-twist__error">Error: {error}</span>
				}
				{taskDayData &&
					Object.entries(taskDayData).map(([dayName, dayTask], i, arr) => (
						<details
							key={dayName}
							class="day"
							open={i === arr.length-1}
						>
							<summary class="day__summary">
								<h3 class="day__heading">{dayName}</h3>
							</summary>

							<div class="day__body">
								<TaskStatusComponent
									task={task}
									dayName={dayName}
								/>
								<Note
									note={dayTask.note}
									onNoteChange={(note) => updateNoteForDay(dayName, note)}
									saveChanges={() => fireCommand(Command.DATA_SAVE)}
								/>
							</div>
						</details>
					))
				}
			</section>
		}
	</>;
}
