import { h } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import classNames from 'classnames';

import { isValidDateString } from '../util/index.js';

import { TaskStatus } from '../types/TaskStatus.js';

import { saveDays, setDayData, useDays } from '../registers/days/index.js';
import { addNewTask, saveTasks, useTasks } from '../registers/tasks/index.js';
import { Command, useCommand } from '../registers/commands/index.js';
import { reorderTasks } from '../registers/tasks/tasksRegister.js';
import { KeyboardShortcutName, useKeyboardShortcut } from '../registers/keyboard-shortcuts/index.js';

import { DayComponent } from './DayComponent.js';
import { toast } from './Toast.js';
import { CommandPalette } from './CommandPalette/CommandPalette.js';
import { TaskList } from './TaskList.js';
import { KeyboardShortcutModal } from './KeyboardShortcutsModal.js';

export function OrangeTwist() {
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

	// Open command palette on keyboard shortcut
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
	useKeyboardShortcut(
		KeyboardShortcutName.COMMAND_PALETTE_OPEN,
		() => setCommandPaletteOpen(true)
	);

	// Scroll to new day when created
	const daySectionsRef = useRef<Record<string, HTMLElement | null>>({});
	const [newDayName, setNewDayName] = useState<string | null>(null);
	useEffect(() => {
		if (newDayName) {
			const newDaySection = daySectionsRef.current[newDayName];
			if (newDaySection) {
				newDaySection.scrollIntoView();
			}
		}
	}, [newDayName]);

	// Scroll to last day when days loads
	const scrolledToLastDay = useRef(false);
	useEffect(() => {
		if (scrolledToLastDay.current) {
			return;
		}

		if (days) {
			const lastDay = Object.values(daySectionsRef.current).at(-1);
			lastDay?.scrollIntoView({ behavior: 'instant' });
			scrolledToLastDay.current = true;
		}
	}, [days]);

	const addNewDay = useCallback((dayNameArg?: string) => {
		if (!days) {
			return;
		}

		const dayName = dayNameArg ?? window.prompt('What day?');
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			window.alert('Invalid day');
			return;
		}

		const existingDayData = days.find((day) => day.dayName === dayName);
		if (existingDayData) {
			window.alert('Day already exists');
			return;
		}

		setDayData(dayName, {});
		setNewDayName(dayName);
	}, [days]);

	useCommand(Command.DAY_ADD_NEW, addNewDay);

	const [newTasksCreated, setNewTasksCreated] = useState(0);
	const [newTaskCreatedDayName, setNewTaskCreatedDayName] = useState<string | null>(null);

	// After the initial load, focus on the last task each time a new one is created.
	const unfinishedTasksListRef = useRef<HTMLElement>(null);
	useEffect(() => {
		if (newTasksCreated  === 0) {
			return;
		}

		const taskListWrapper = (() => {
			if (newTaskCreatedDayName === null) {
				return unfinishedTasksListRef.current;
			}

			return daySectionsRef.current?.[newTaskCreatedDayName];
		})();

		if (!taskListWrapper) {
			return;
		}

		// Find new task and put it in edit mode, then scroll to it

		// TODO: Is this the best way to find the right element?
		const taskEditButtons = Array.from(taskListWrapper.querySelectorAll<HTMLElement>('.js-task__name-edit') ?? []);
		const lastTaskEditButton = taskEditButtons.at(-1);

		lastTaskEditButton?.click();
		lastTaskEditButton?.scrollIntoView({
			block: 'center',
			behavior: 'smooth',
		});
	}, [newTasksCreated, newTaskCreatedDayName]);

	/**
	 * Create a new task and then scroll to it immediately.
	 *
	 * @param [dayName] If specified, also add the task to the
	 * specified day and scroll to its input within that day.
	 */
	const addNewTaskUI = useCallback((dayName?: string) => {
		const newTaskId = addNewTask({ dayName });
		if (dayName) {
			setDayData(dayName, {
				tasks: [{
					id: newTaskId,
					status: TaskStatus.TODO,
				}],
			});
		}
		setNewTasksCreated((oldValue) => oldValue + 1);
		setNewTaskCreatedDayName(dayName ?? null);
	}, []);
	useCommand(Command.TASK_ADD_NEW, addNewTaskUI);

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

	const onOpenTasksReorder = useCallback((taskIds: number[]) => {
		reorderTasks(taskIds);
		saveData();
	}, [saveData]);

	return <>
		<CommandPalette
			open={commandPaletteOpen}
			onClose={() => setCommandPaletteOpen(false)}
		/>

		<div class="orange-twist">
			<h1 class="orange-twist__heading">Orange Twist</h1>

			<section
				class={classNames({
					'orange-twist__section': true,
					'orange-twist__section--loading': isDaysLoading,
				})}
				aria-busy={isDaysLoading || undefined}
			>
				<h2 class="orange-twist__title">Days</h2>

				{
					isDaysLoading &&
					<span class="orange-twist__loader" title="Loading" />
				}
				{
					daysError &&
					// TODO: Handle error better somehow
					<span class="orange-twist__error">Error: {daysError}</span>
				}
				{
					days && <>
						{days.map((day, i) => {
							return <DayComponent
								key={day.dayName}
								ref={(ref: HTMLDetailsElement | null) => daySectionsRef.current[day.dayName] = ref}
								day={day}
								open={i === days.length-1}
							/>;
						})}

						<button
							type="button"
							class="button"
							onClick={() => addNewDay()}
						>Add day</button>
					</>
				}
			</section>

			<section
				class={classNames({
					'orange-twist__section': true,
					'orange-twist__section--loading': isTasksLoading,
				})}
				aria-busy={isTasksLoading || undefined}
				ref={unfinishedTasksListRef}
			>
				<h2 class="orange-twist__title">Tasks</h2>

				{
					isTasksLoading &&
					<span class="orange-twist__loader" title="Tasks loading" />
				}
				{
					tasksError &&
					<span class="orange-twist__error">Tasks loading error: {tasksError}</span>
				}
				{
					tasks && <>
						<TaskList
							tasks={tasks.filter((task) => task.status !== TaskStatus.COMPLETED)}
							onReorder={onOpenTasksReorder}
							className="orange-twist__task-list"
						/>

						<button
							type="button"
							class="button"
							onClick={() => addNewTaskUI()}
						>Add new task</button>
					</>
				}
			</section>

			{
				tasks &&
				<details class="orange-twist__section">
					<summary class="orange-twist__section-summary">
						<h2 class="orange-twist__title">Completed tasks</h2>
					</summary>

					<TaskList
						tasks={tasks.filter((task) => task.status === TaskStatus.COMPLETED)}
						className="orange-twist__task-list"
					/>
				</details>
			}
		</div>

		<KeyboardShortcutModal />
	</>;
}
