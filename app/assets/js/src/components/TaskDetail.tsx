import { useCallback } from 'preact/hooks';
import { getDayData, saveDays, setDayData, useDays } from '../registers/days/index.js';
import { saveTasks, useTasks } from '../registers/tasks/index.js';
import { Note } from './Note.js';

import { TaskStatusComponent } from './TaskStatusComponent.js';
import { fireCommand } from '../registers/commands/commandsRegister.js';
import { Command, useCommand } from '../registers/commands/index.js';
import { toast } from './Toast.js';

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
		const dayData = getDayData(dayName);
		if (!dayData) {
			// TODO: Handle this error better
			throw new Error(`Trying to update note again ${dayName} but no such day exists`);
		}
		const dayTasks = dayData.tasks;
		const taskIndexForDay = dayTasks.findIndex(({ id }) => id === taskId);

		if (taskIndexForDay === -1) {
			// TODO: Should we add the task? We'd need to know what status to use if so
			throw new Error(`Task doesn't exist against ${dayName}`);
		}

		const taskForDay = dayTasks[taskIndexForDay];
		dayTasks.splice(taskIndexForDay, 1, {
			...taskForDay,
			note,
		});

		setDayData(dayName, { tasks: dayTasks });
	}, [taskId]);

	// TODO: This is copy/pasted from OrangeTwist, but it shouldn't need duplication
	/**
	 * Save all day and task data, while giving the user feedback,
	 * then queue up a fresh autosave timer.
	 */
	const saveData = useCallback(
		async () => {
			const toastId = `saving-${crypto.randomUUID()}`;

			// TODO: Show a nicer loader
			toast('Saving...', {
				id: toastId,
			});
			await Promise.all([
				saveDays(),
				saveTasks(),
			]);
			toast('Saved', {
				duration: 2000,
				id: toastId,
			});
		},
		[]
	);
	useCommand(Command.DATA_SAVE, saveData);

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
