import { createContext, h } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';
import htm from 'htm';

import classNames from 'classnames';

import { isValidDateString } from '../util/isValidDateString.js';

import { DayComponent, DayProps as DayComponentProps } from './DayComponent.js';

import { saveDays, setDayData, useDays } from '../registers/days/index.js';
import { addNewTask, saveTasks, useTasks } from '../registers/tasks/index.js';
import { TaskComponent, TaskComponentProps } from './TaskComponent.js';
import { toast } from './Toast.js';
import { TaskStatus } from '../types/TaskStatus.js';

// Initialise htm with Preact
const html = htm.bind(h);

type OrangeTwistApi = {
	save(): void;
}

export const OrangeTwistContext = createContext<OrangeTwistApi>({
	save() {},
});

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

	const unfinishedTasksListRef = useRef<HTMLElement>(null);

	const addNewDay = useCallback(() => {
		if (!days) {
			return;
		}

		const dayName = window.prompt('What day?');
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

	const [newTasksCreated, setNewTasksCreated] = useState(0);
	const focusOnLastUnfinishedTask = useCallback(() => {
		// TODO: Is this the best way to find the right element to focus on?
		const taskInputs = Array.from(unfinishedTasksListRef.current?.querySelectorAll('input') ?? []);
		const lastTaskInput = taskInputs.at(-1);
		// Focus on the input and select all its text
		lastTaskInput?.select();
	}, []);

	// After the initial load, focus on the last task each time a new one is created.
	useEffect(() => {
		if (newTasksCreated > 0) {
			focusOnLastUnfinishedTask();
		}
	}, [newTasksCreated]);

	const addNewTaskUI = useCallback(() => {
		addNewTask();
		setNewTasksCreated((oldValue) => oldValue + 1);
	}, []);

	/**
	 * How many minutes should pass between each autosave.
	 */	const autosaveMinutes = 1;
	const autosaveTimeout = useRef<number | null>(null);

	/**
	 * Start a timeout to automatically save.
	 */
	const queueAutosave = useCallback(() => {
		if (autosaveTimeout.current !== null) {
			window.clearTimeout(autosaveTimeout.current);
		}

		autosaveTimeout.current = window.setInterval(() => {
			saveData();
		}, autosaveMinutes * 1000 * 60);
	}, []);

	const saveData = useCallback(async () => {
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

		// Reset autosave timeout
		if (autosaveTimeout.current !== null) {
			window.clearTimeout(autosaveTimeout.current);
		}
		queueAutosave();
	}, []);

	/**
	 * Queue autosave on initial render
	 */
	useEffect(() => {
		queueAutosave();

		return () => {
			if (autosaveTimeout.current !== null) {
				window.clearInterval(autosaveTimeout.current);
			}
		};
	}, [saveData]);

	// Set up keyboard shortcuts
	useEffect(() => {
		const saveOnKeyboardShortcut = (e: KeyboardEvent) => {
			if (e.key === 's' && e.ctrlKey) {
				e.preventDefault();
				saveData();
			}
		};
		const addNewTaskOnKeyboardShortcut = (e: KeyboardEvent) => {
			if (e.key === 'n' && e.ctrlKey) {
				e.preventDefault();
				addNewTaskUI();
			}
		};

		document.addEventListener('keydown', saveOnKeyboardShortcut);
		document.addEventListener('keydown', addNewTaskOnKeyboardShortcut);

		return () => {
			document.removeEventListener('keydown', saveOnKeyboardShortcut);
			document.removeEventListener('keydown', addNewTaskOnKeyboardShortcut);
		};
	}, []);

	return html`
		<${OrangeTwistContext.Provider}
			value="${{
				save: saveData,
			}}"
		>
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
										...${dayProps}
									/>
								`;
							})}

							<button
								type="button"
								class="button"
								onClick="${addNewDay}"
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
							<!-- TODO: Reduce duplication -->
							<ul
								class="orange-twist__task-list"
								ref="${unfinishedTasksListRef}"
							>
								${tasks.map(
									(task) => {
										const taskProps: TaskComponentProps = { task };

										if (task.status === TaskStatus.COMPLETED) {
											return '';
										}

										return html`<li
											key="${task.id}"
										><${TaskComponent} ...${taskProps} /></li>`;
									}
								)}
							</ul>

							<button
								type="button"
								class="button"
								onClick="${addNewTaskUI}"
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

							<ul class="orange-twist__task-list">
								${tasks.map(
									(task) => {
										const taskProps: TaskComponentProps = { task };

										if (task.status !== TaskStatus.COMPLETED) {
											return '';
										}

										return html`<li
											key="${task.id}"
										><${TaskComponent} ...${taskProps} /></li>`;
									}
								)}
							</ul>
						</details>
					`
				}
			</div>
		</${OrangeTwistContext.Provider}>
	`;
}
