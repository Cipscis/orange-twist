import { h } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';
import htm from 'htm';

import classNames from 'classnames';

import { isValidDateString } from '../util/index.js';

import { TaskStatus } from '../types/TaskStatus.js';

import { saveDays, setDayData, useDays } from '../registers/days/index.js';
import { addNewTask, saveTasks, useTasks } from '../registers/tasks/index.js';
import { Command, useCommand } from '../registers/commands/index.js';
import { reorderTasks } from '../registers/tasks/tasksRegister.js';
import { KeyboardShortcutName, useKeyboardShortcut } from '../registers/keyboard-shortcuts/index.js';

import { DayComponent, DayProps as DayComponentProps } from './DayComponent.js';
import { toast } from './Toast.js';
import { CommandPalette } from './CommandPalette.js';
import { TaskList } from './TaskList.js';
import { KeyboardShortcutModal } from './KeyboardShortcutsModal.js';

// Initialise htm with Preact
const html = htm.bind(h);

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

	const daySectionsRef = useRef<Record<string, HTMLElement>>({});
	const unfinishedTasksListRef = useRef<HTMLElement>(null);

	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
	useKeyboardShortcut(KeyboardShortcutName.COMMAND_PALETTE_OPEN, () => setCommandPaletteOpen(true));

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
	}, [days]);

	useCommand(Command.DAY_ADD_NEW, addNewDay);

	const [newTasksCreated, setNewTasksCreated] = useState(0);
	const [newTaskCreatedDayName, setNewTaskCreatedDayName] = useState<string | null>(null);

	// After the initial load, focus on the last task each time a new one is created.
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

		// TODO: Is this the best way to find the right element to focus on?
		const taskInputs = Array.from(taskListWrapper.querySelectorAll('input') ?? []);
		const lastTaskInput = taskInputs.at(-1);

		// Focus on the input and select all its text
		lastTaskInput?.focus();
		lastTaskInput?.scrollIntoView({
			block: 'center',
			behavior: 'smooth',
		});
	}, [newTasksCreated, newTaskCreatedDayName]);

	const addNewTaskUI = useCallback((dayName?: string) => {
		addNewTask();
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

	return html`
		<${CommandPalette}
			open="${commandPaletteOpen}"
			onClose="${() => setCommandPaletteOpen(false)}"
		/>

		<div class="orange-twist">
			<h1 class="orange-twist__heading">Orange Twist</h1>

			<section
				class="${classNames({
					'orange-twist__section': true,
					'orange-twist__section--loading': isDaysLoading,
				})}"
				aria-busy="${isDaysLoading || null}"
			>
				<h2 class="orange-twist__title">Days</h2>

				${
					isDaysLoading &&
					html`<span class="orange-twist__loader" title="Loading"></span>`
				}
				${
					daysError &&
					// TODO: Handle error better somehow
					html`<span class="orange-twist__error">Error: ${daysError}</span>`
				}
				${
					days &&
					html`
						${days.map((day) => {
							const dayProps: DayComponentProps = { day };
							return html`
								<${DayComponent}
									key="${day.dayName}"
									ref="${(ref: HTMLElement) => daySectionsRef.current[day.dayName] = ref}"
									...${dayProps}
								/>
							`;
						})}

						<button
							type="button"
							class="button"
							onClick="${() => addNewDay()}"
						>Add day</button>
					`
				}
			</section>

			<section
				class="${classNames({
					'orange-twist__section': true,
					'orange-twist__section--loading': isTasksLoading,
				})}"
				aria-busy="${isTasksLoading || null}"
				ref="${unfinishedTasksListRef}"
			>
				<h2 class="orange-twist__title">Tasks</h2>

				${
					isTasksLoading &&
					html`<span class="orange-twist__loader" title="Tasks loading"></span>`
				}
				${
					tasksError &&
					html`<span class="orange-twist__error">Tasks loading error: ${tasksError}</span>`
				}
				${
					tasks &&

					html`
						<${TaskList}
							tasks="${tasks.filter((task) => task.status !== TaskStatus.COMPLETED)}"
							onReorder="${onOpenTasksReorder}"
							className="orange-twist__task-list"
						/>

						<button
							type="button"
							class="button"
							onClick="${() => addNewTaskUI()}"
						>Add new task</button>
					`
				}
			</section>

			${
				tasks &&

				html`
					<details class="orange-twist__section">
						<summary>
							<h2 class="orange-twist__title">Completed tasks</h2>
						</summary>

						<${TaskList}
							tasks="${tasks.filter((task) => task.status === TaskStatus.COMPLETED)}"
							className="orange-twist__task-list"
						/>
					</details>
				`
			}
		</div>

		<${KeyboardShortcutModal} />
	`;
}
